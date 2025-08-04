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
  @Input() routePoints:boolean = false;
  @Input() showBtnPermission: string = '';

  @Output() changeMarkersLocation = new EventEmitter<any>();
  customMarkers: any = []
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;
  private currentPolyline: google.maps.Polyline | null = null;

  markerInInitValue: any = null
  private map!: google.maps.Map;
  private googleMarker: google.maps.Marker | null = null;
  googleMarkers: any = []
  constructor(private googleMapsLoader: GoogleMapsLoaderService,
    private googleDirectionsService: GoogleDirectionsService,
  ) {}
  markerSelected: any = null
  async ngAfterViewInit() {
    console.log('llllllllllllll88');
    
    await this.googleMapsLoader.load('AIzaSyDtmiNwQ0ENlzy3taEnwcHck41TXOWbWao');
    const mapElement = this.mapContainer.nativeElement;

    this.map = new google.maps.Map(mapElement, {
      center: { lat: 19.097195132864133, lng:  -70.59881283897987 },
      zoom: 7,
      zoomControl: false,       // Oculta el control de zoom
      mapTypeControl: false,    // Oculta la opción "Mapa/Satélite"
      // streetViewControl: false, // Oculta el ícono de Street View
      fullscreenControl: false, // Oculta el botón de pantalla completa
    });

    await this.addMarkersFromInput();
if (this.routePoints && this.showBtnPermission == 'driver') {
  await this.drawRouteUsingGoogleAPI();
}

  }

  async ngOnChanges() {
    if (this.map) {
      if (this.markerToHighlight && this.markerToHighlight.coordinate) {
        const { lat, lng } = this.markerToHighlight.coordinate;
        const newCenter = new google.maps.LatLng(lat, lng);

        this.map.setCenter(newCenter);
        this.map.setZoom(15);

        this.markerInInitValue = {lat, lng}
      }

      if (this.showAllMarkers && this.markers.length > 1) {
        this.fitMapUsingMidpointAndZoom();
      }
      await this.addMarkersFromInput();
      
    }
    if (this.routePoints && this.showBtnPermission == 'driver' && this.markers.length < 2) {
  // await this.addRouteWithMarkers();
  await this.drawRouteUsingGoogleAPI();
    }
  }

  private async addMarkersFromInput() {
    if (!this.map || !Array.isArray(this.markers)) return;
  
    // Limpiar marcadores anteriores
    this.googleMarkers.forEach((m: any) => m.setMap(null));
    this.googleMarkers = [];
  
    // Crear nuevos marcadores
    for (const marker of this.markers) {
      const gMarker = new google.maps.Marker({
        position: { lat: marker.lat, lng: marker.lng },
        map: this.map,
        draggable: true,
        label: {
          text: marker.name,
          color: "#000000", // color del texto
          fontWeight: "bold",
          fontSize: "12px"
        },
        icon: marker.iconUrl
          ? {
              url: marker.iconUrl,
              scaledSize: new google.maps.Size(32, 32),
            }
          : undefined,
      });
      
      // Emitir evento cuando se arrastre el marcador
      gMarker.addListener('dragend', () => {
        this.changeMarkersLocation.emit({
          id: marker.id,
          lat: gMarker.getPosition()?.lat(),
          lng: gMarker.getPosition()?.lng(),
        });
      });
  
      this.googleMarkers.push(gMarker);
    }
  
    // Centrar la cámara en el primer marcador
    if (this.markers.length > 0) {
      this.map.setCenter({ lat: this.markers[0].lat, lng: this.markers[0].lng });
      this.map.setZoom(14);
    }
  }
  

  private fitMapUsingMidpointAndZoom() {
    if (this.markers.length < 2) return;

    const pointA = this.markers[0].coordinate;
    const pointB = this.markers[1].coordinate;

    const center = {
      lat: (pointA.lat + pointB.lat) / 2,
      lng: (pointA.lng + pointB.lng) / 2
    };

    const distance = this.haversineDistance(pointA, pointB);
    const marginFactor = 1.2;
    const requiredWidth = distance * marginFactor;
    const midLatRadians = (center.lat * Math.PI) / 180;

    let zoomCalc = Math.floor(
      Math.log((56355.4922112 * Math.cos(midLatRadians)) / requiredWidth) / Math.log(2)
    );

    zoomCalc = Math.min(Math.max(zoomCalc, 1), 17);

    this.map.setCenter(center);
    this.map.setZoom(zoomCalc);
  }

  private haversineDistance(p1: { lat: number; lng: number }, p2: { lat: number; lng: number }): number {
    const toRad = (angle: number) => (angle * Math.PI) / 180;
    const R = 6371; // Earth's radius in km
    const dLat = toRad(p2.lat - p1.lat);
    const dLng = toRad(p2.lng - p1.lng);
    const lat1 = toRad(p1.lat);
    const lat2 = toRad(p2.lat);

    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLng / 2) ** 2;
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
    const points = this.markers.map(m => ({
      lat: m.lat ?? m.coordinate?.lat,
      lng: m.lng ?? m.coordinate?.lng
    }));
  
    try {
      const routePoints = await this.googleDirectionsService.getRoutePolyline(points);
      console.log('Ruta generada:', routePoints);
  
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
        routePoints.forEach(p => bounds.extend(p));
        this.map.fitBounds(bounds);
      } else {
        console.warn('No se pudo obtener la ruta o está vacía');
      }
    } catch (error) {
      console.error('Error dibujando la ruta:', error);
    }
  }
  
}
