import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { GoogleMap } from '@capacitor/google-maps';
import { environment } from 'src/environments/environment.prod';
import { GoogleDirectionsService } from 'src/app/services/google-directions.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  standalone: true,
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.scss'],
  imports: [CommonModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MapsComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('map', { static: false }) mapRef!: ElementRef<HTMLElement>;
  @Input() markers: any[] = [];
  @Output() markerMoved = new EventEmitter<{
    id: string;
    lat: number;
    lng: number;
  }>();



  constructor(private googleDirectionsService: GoogleDirectionsService,
        private toastService: ToastService,
    
  ){}

  @Input() routePoints:boolean = false;
  @Input() showBtnPermission: string = '';
  private polylineId?: string;
  private map!: GoogleMap;
  private markerIds: string[] = [];

  async ngAfterViewInit() {

    await this.createMap();
    await this.addMarkersFromInput();
    if (this.routePoints && this.showBtnPermission == 'driver' && this.markers.length < 2) {
      await this.drawRouteUsingGoogleAPI();


    }
  }


  async ngOnChanges(changes: SimpleChanges) {
  if (changes['markers']) {
    const current = changes['markers'].currentValue;
    const previous = changes['markers'].previousValue;

    // Evitar ejecución si markers no ha cambiado realmente
    const hasChanges =
      !previous ||
      previous.length !== current.length ||
      JSON.stringify(previous) !== JSON.stringify(current);

    if (hasChanges && this.map) {
      await this.removeAllMarkers();
      await this.addMarkersFromInput();
    if (this.routePoints && this.showBtnPermission == 'driver') {

        await this.drawRouteUsingGoogleAPI();

      }
    }
  }

}

  private async createMap() {
    await new Promise<void>((resolve) => {
      const checkReady = () => {
        if (this.mapRef?.nativeElement instanceof HTMLElement) {
          resolve();
        } else {
          requestAnimationFrame(checkReady);
        }
      };
      checkReady();
    });

    this.map = await GoogleMap.create({
      id: 'my-map',
      element: this.mapRef.nativeElement,
      apiKey: 'AIzaSyDtmiNwQ0ENlzy3taEnwcHck41TXOWbWao',
      config: {
        center: { lat: 18.48, lng: -69.9 },
        zoom: 12,
      },
    });
  }

  private async addMarkersFromInput() {
    if (!this.markers || !Array.isArray(this.markers)) return;

    this.markerIds = [];

    for (const marker of this.markers) {
      const result: any = await this.map.addMarker({
        coordinate: { lat: marker.lat, lng: marker.lng },
        title: marker.name,
        draggable: true,
        ...(marker.iconUrl
          ? { iconUrl: marker.iconUrl }
          : { iconColor: marker.iconColor }),
      });

      this.markerIds.push(result.id);
    }

    if (this.markers.length > 0) {
      await this.map.setCamera({
        coordinate: {
          lat: this.markers[0].lat,
          lng: this.markers[0].lng,
        },
        zoom: 14,
      });
    }

    await this.map.setOnMarkerDragEndListener(
      ({ latitude, longitude, markerId }) => {
        this.markerMoved.emit({ id: markerId, lat: latitude, lng: longitude });
      }
    );
  }

  private async removeAllMarkers() {
    if (this.markerIds.length > 0) {
      await this.map.removeMarkers(this.markerIds);
      this.markerIds = [];
    }
  }

  ngOnDestroy() {
    this.map?.destroy();
  }

  // if (response.status === 'OK' && response.routes.length > 0) {
  //   const route = response.routes[0];
  //   const path = route.overview_path.map(coord => ({
  //     lat: coord.lat(),
  //     lng: coord.lng(),
  //   }));
  
  //   // ✅ Solo si hay path válido, agregas el polyline
  //   if (path.length > 0) {
  //     await this.map.addPolylines({
  //       id: 'my-map',
  //       polylines: [
  //         {
  //           path,
  //           color: '#4285F4',  // ✅ Esto es `strokeColor`
  //           width: 5,
  //         },
  //       ],
  //     });
  //   }
  // } else {
  //   console.error('No se pudo obtener la ruta:', response.status);
  // }

  
async drawRouteUsingGoogleAPI() {
  if (!this.map || this.markers.length < 2) return;

  try {
    const routePoints = await this.googleDirectionsService.getRoutePolyline(this.markers);
    if (routePoints) {
      // Elimina la línea anterior si existe
      if (this.polylineId) {
        await this.map.removePolylines([this.polylineId]);
      }
  
      const ids = await this.map.addPolylines([
        {
          path: routePoints,
          color: '#4285F4',
          width: 5,
        } as any,
      ]);
  
      this.polylineId = ids[0];
  
      // Opcional: centrar cámara
      await this.map.setCamera({
        coordinate: routePoints[0],
        zoom: 14,
      });
      
    } else {
      this.toastService.presentToast(
        `📍 No se encontro una ruta para las coordenadas proporcionadas`, 'danger', 1000000
      );
      this.toastService.presentToast(
       JSON.stringify(routePoints), 'danger', 9000000
      );
    console.error(routePoints,'No se pudo obtener la ruta??????????????????????????????????????????????????????????????????????????????????************************************************:', );
      
    }
  } catch (err) {
    console.error('Error obteniendo ruta:', err);
  }
}

}
