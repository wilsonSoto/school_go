import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { GoogleMapsLoaderService } from './maps.services';
import { GoogleDirectionsService } from 'src/app/services/google-directions.service';
import { ObserverBetweenComponentsService } from 'src/app/services/observer-between-components.services';
import { LocationService } from 'src/app/services/geolocation.service';
import { getDistanceFromLatLonInMeters } from 'src/app/shared/utils/getDistanceFromLatLonInMeters';
import { FcmService } from 'src/app/services/fcm.service';
import { tap, catchError, finalize, switchMap, map } from 'rxjs/operators';
import { ToastService } from 'src/app/services/toast.service';
import { Observable, of, interval, Subscription } from 'rxjs';
import { cleanToken } from 'src/app/shared/utils/cleanToken';

@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.scss'],
})
export class MapsComponent implements AfterViewInit, OnDestroy {
  @Input() fullScreen: boolean = false;
  @Input() markers: Array<any> = [];
  @Input() markerToHighlight: any = null;
  @Input() showAllMarkers: boolean = false;
  @Input() routePlanned: boolean = false;
  @Input() routePoints: boolean = false;
  @Input() showBtnPermission: string = '';

  @Output() changeMarkersLocation = new EventEmitter<any>();
  customMarkers: any = [];
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;
  private currentPolyline: google.maps.Polyline | null = null;

  markerInInitValue: any = null;
  private map!: google.maps.Map;
  private googleMarker: google.maps.Marker | null = null;
  googleMarkers: any = [];
  constructor(
    private googleMapsLoader: GoogleMapsLoaderService,
    private googleDirectionsService: GoogleDirectionsService,
    private fcmService: FcmService,
    private locationService: LocationService,
    private observerService: ObserverBetweenComponentsService,
    private toastService: ToastService
  ) {}
  markerSelected: any = null;
  private notifiedStudents: Set<any> = new Set();

  ngOnInit() {
    // this.locationService.simulateMovement(19.3971, -70.5864);
  }

  async ngAfterViewInit() {
    await this.googleMapsLoader.load('AIzaSyDtmiNwQ0ENlzy3taEnwcHck41TXOWbWao');
    const mapElement = this.mapContainer.nativeElement;

    this.map = new google.maps.Map(mapElement, {
      center: { lat: 19.097195132864133, lng: -70.59881283897987 },
      zoom: 7,
      zoomControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
    });

    // this.observerService.driverLocation$.subscribe(async (position) => {
    //   if (position) {
    //     if (this.googleMarker) {
    //       this.updateMapWithNewLocation(position);
    //     } else {
    //       //        const lat = position.coords.latitude;
    //       // const lng = position.coords.longitude;
    //       await this.addMarkersFromInput();
    //     }

    //     // 🔔 Verificar distancia con estudiantes
    //     const driverLat = position.coords.latitude;
    //     const driverLng = position.coords.longitude;
    //     const studentsNotification = this.markers.filter((st: any) => st.is_student_point)
    //     // console.log(studentsNotification,'/////?????????????????????????');
    //         // this.toastService.presentToast(JSON.stringify(studentsNotification), 1);
    //         // this.toastService.presentToast(JSON.stringify(this.markers), 1);
        
    //     for (const marker of studentsNotification) {
    //       // alert(1)
    //       if (marker.id !== '1-dr') {
    //       // alert(2)
    //          if (!marker.is_student_point) continue; // ✅ solo estudiantes
    //       // alert(3)

    //         // Evitar compararse consigo mismo
    //         const distance = await getDistanceFromLatLonInMeters(
    //           driverLat,
    //           driverLng,
    //           marker.lat,
    //           marker.lng
    //         );

    //         // if (distance < 1000) {
    //         // 👇 Enviar notificación

    //         if (!this.notifiedStudents.has(marker.id)) {
    //           this.sendProximityNotification(marker);
    //           // this.notifiedStudents.add(marker.id);
    //         }
    //         // }
    //       }
    //     }
    //   }
    // });

    this.observerService.driverLocation$.subscribe(async (position) => {
      if (position) {
        if (this.googleMarker) {
          this.updateMapWithNewLocation(position);
        } else {
          await this.addMarkersFromInput();
        }

        // 🔔 Verificar distancia con estudiantes
        const driverLat = position.coords.latitude;
        const driverLng = position.coords.longitude;
        const studentsNotification = this.markers.filter((st: any) => st.is_student_point)

        for (const marker of studentsNotification) {
          if (marker.id !== '1-dr') {
            //  if (!marker.is_student_point) continue; // ✅ solo estudiantes

            const distance = getDistanceFromLatLonInMeters(
              driverLat,
              driverLng,
              marker.lat,
              marker.lng
            );

            // 📢 Distancias a chequear
            this.checkProximityAndNotify(marker, distance);
          }
        }
      }
    });

    await this.addMarkersFromInput();
    if (this.routePoints && this.showBtnPermission === 'driver') {
      // await this.drawRouteUsingGoogleAPI();
    }
  }

  private checkProximityAndNotify(marker: any, distance: number) {
    //  if (!marker.is_student_point) return; // ✅ doble seguridad

    // Distancias a manejar
    const thresholds = [
      {
        value: 1000,
        message: `Tu transporte está a menos de 5 minutos de ti (${marker.name})`,
      },
      {
        value: 150,
        message: `Tu transporte está a menos de 2 minutos m de ti (${marker.name})`,
      },
      {
        value: 20,
        message: `Tu transporte ha llegado a tu punto de recogida (${marker.name})`,
      }, // ~20 m como tolerancia
    ];

    for (const t of thresholds) {
      const key = `${marker.id}-${t.value}`; // Clave única por estudiante y distancia
      if (distance <= t.value && !this.notifiedStudents.has(key)) {
        this.sendProximityNotification({ ...marker, customMsg: t.message });
        this.notifiedStudents.add(key);
      }
    }
  }

  async sendProximityNotification(marker: any) {
    let tokenReview = await cleanToken(marker.fcm_token);

    const notificationData = {
      token: tokenReview ?? null,
      msm:
        marker.customMsg ??
        `Tu transporte está llegando cerca de ti (${marker.name})`,
      title: 'Transporte escolar cerca',
    };

    if (notificationData.token) {
      this.fcmService
        .sendNotification(notificationData)
        .pipe(
          tap((response: any) => {
            this.toastService.presentToast('✅ Notificación enviada');
            if (response.data) {
              console.log(response);
              console.log('✅ Notificación enviada', response);
            }
          }),
          catchError((err) => {
            this.toastService.presentToast(JSON.stringify(err));
            return of([]);
          }),
          finalize(() => {
            setTimeout(() => {}, 0);
          })
        )
        .subscribe();
    } else {
            this.toastService.presentToast(`⚠️ No se encontró token FCM para prueba`);

      console.warn(`⚠️ No se encontró token FCM para prueba`);
    }
  }

  startSimulatedMovementToStudents() {
  const driver = this.markers.find(m => m.id === '1-dr');
  const students = this.markers.filter(m => m.is_student_point);
alert(1)
  if (!driver || students.length === 0) {
    console.warn('No hay chofer o estudiantes.');
    return;
  }

  const startLat = driver.lat;
  const startLng = driver.lng;
  const targets = students.map(s => ({ lat: s.lat, lng: s.lng, id: s.id }));

  this.locationService.simulateMovementToMarkers(startLat, startLng, targets);
}


  startSimulatedMovement() {
    // Puedes definir coordenadas iniciales o usarlas dinámicamente
    const startLat = this.markers[this.markers.length - 1].lat; //19.3971;
    const startLng = this.markers[this.markers.length - 1].lng; //-70.5864;
    this.locationService.simulateMovement(startLat, startLng);
  }

  private updateMapWithNewLocation(position: GeolocationPosition) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    console.log(this.markers, '[[[[[mark');
    console.log(this.googleMarker, '[[[[[googleMarker');

    const newLatLng = new google.maps.LatLng(lat, lng);

    // Si ya existe el marcador del usuario, solo muévelo
    if (this.googleMarker) {
      this.googleMarker.setPosition(newLatLng);
    } else {
      this.googleMarker = new google.maps.Marker({
        position: newLatLng,
        map: this.map,
        title: 'Tu ubicación actual',
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png', // ícono azul
          scaledSize: new google.maps.Size(40, 40),
        },
      });
    }

    // Centrar el mapa en la nueva ubicación
    this.map.setCenter(newLatLng);
  }

  async ngOnChanges() {
    if (this.map) {
      if (this.markerToHighlight && this.markerToHighlight.coordinate) {
        const { lat, lng } = this.markerToHighlight.coordinate;
        const newCenter = new google.maps.LatLng(lat, lng);

        this.map.setCenter(newCenter);
        this.map.setZoom(15);

        this.markerInInitValue = { lat, lng };
      }

      if (this.showAllMarkers && this.markers.length > 1) {
        this.fitMapUsingMidpointAndZoom();
      }
      await this.addMarkersFromInput();
    }
    if (
      this.routePoints &&
      this.showBtnPermission == 'driver' &&
      this.markers.length < 2
    ) {
      // await this.addRouteWithMarkers();
      await this.drawRouteUsingGoogleAPI();
    }
  }

  private async addMarkersFromInput() {
    if (!this.map || !Array.isArray(this.markers)) return;
    // console.log(this.markers, '[[[[[mark');

    // Limpiar marcadores anteriores
    this.googleMarkers.forEach((m: any) => m.setMap(null));
    this.googleMarkers = [];
    this.googleMarker = null; // Reiniciar marcador del chofer

    for (const marker of this.markers) {
      const gMarker = new google.maps.Marker({
        position: { lat: marker.lat, lng: marker.lng },
        map: this.map,
        draggable: true,
        label: {
          text: marker.name,
          color: '#000000',
          fontWeight: 'bold',
          fontSize: '12px',
        },
        icon: marker.iconUrl
          ? {
              url: marker.iconUrl,
              scaledSize: new google.maps.Size(32, 32),
            }
          : undefined,
      });
      // console.log(marker, '//////lo');

      // ✅ Identificar el marcador del chofer por ID
      if (marker.id === '1-dr') {
        this.googleMarker = gMarker;
      }

      gMarker.addListener('dragend', () => {
        this.changeMarkersLocation.emit({
          id: marker.id,
          lat: gMarker.getPosition()?.lat(),
          lng: gMarker.getPosition()?.lng(),
        });
      });

      this.googleMarkers.push(gMarker);
    }

    if (this.markers.length > 0) {
      this.map.setCenter({
        lat: this.markers[0].lat,
        lng: this.markers[0].lng,
      });
      this.map.setZoom(14);
    }
  }

  private fitMapUsingMidpointAndZoom() {
    if (this.markers.length < 2) return;

    const pointA = this.markers[0].coordinate;
    const pointB = this.markers[1].coordinate;

    const center = {
      lat: (pointA.lat + pointB.lat) / 2,
      lng: (pointA.lng + pointB.lng) / 2,
    };

    const distance = this.haversineDistance(pointA, pointB);
    const marginFactor = 1.2;
    const requiredWidth = distance * marginFactor;
    const midLatRadians = (center.lat * Math.PI) / 180;

    let zoomCalc = Math.floor(
      Math.log((56355.4922112 * Math.cos(midLatRadians)) / requiredWidth) /
        Math.log(2)
    );

    zoomCalc = Math.min(Math.max(zoomCalc, 1), 17);

    this.map.setCenter(center);
    this.map.setZoom(zoomCalc);
  }

  private haversineDistance(
    p1: { lat: number; lng: number },
    p2: { lat: number; lng: number }
  ): number {
    const toRad = (angle: number) => (angle * Math.PI) / 180;
    const R = 6371; // Earth's radius in km
    const dLat = toRad(p2.lat - p1.lat);
    const dLng = toRad(p2.lng - p1.lng);
    const lat1 = toRad(p1.lat);
    const lat2 = toRad(p2.lat);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  ngOnDestroy() {
    if (this.googleMarker) {
      this.googleMarker.setMap(null);
    }
    this.googleMarker = null;
  }

  private async drawRouteUsingGoogleAPI() {
    if (!this.map || this.markers.length < 2) return;

    // ✅ Soporta markers con lat/lng o coordinate.lat/lng
    const points = this.markers.map((m) => ({
      lat: m.lat ?? m.coordinate?.lat,
      lng: m.lng ?? m.coordinate?.lng,
    }));

    try {
      const routePoints = await this.googleDirectionsService.getRoutePolyline(
        points
      );
      // console.log('Ruta generada:', routePoints);

      if (routePoints?.length) {
        // Limpiar polyline anterior si existía
        if (this.currentPolyline) {
          this.currentPolyline.setMap(null);
        }

        // Dibujar la polyline
        this.currentPolyline = new google.maps.Polyline({
          path: routePoints,
          geodesic: true,
          strokeColor: '#4285F4',
          strokeOpacity: 1.0,
          strokeWeight: 5,
          map: this.map,
        });

        // Ajustar la cámara a la ruta
        const bounds = new google.maps.LatLngBounds();
        routePoints.forEach((p) => bounds.extend(p));
        this.map.fitBounds(bounds);
      } else {
        console.warn('No se pudo obtener la ruta o está vacía');
      }
    } catch (error) {
      console.error('Error dibujando la ruta:', error);
    }
  }
}
