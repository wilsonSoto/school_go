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



  constructor(private googleDirectionsService: GoogleDirectionsService){}
  
  @Input() routePoints:boolean = false;
  private polylineId?: string;
  private map!: GoogleMap;
  private markerIds: string[] = [];

  async ngAfterViewInit() {

    await this.createMap();
    await this.addMarkersFromInput();
    if (this.routePoints) {
      console.log(this.markers,'///////////markers////////////////');
      
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
      if (this.routePoints) {
        console.log(this.markers,'///////////markers///////22/////////');
        
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
      apiKey: 'AIzaSyBsnbQOBYbbUuDL2Dzpd_7D-wlXz-1B5bg',
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



private async drawPolyline000(points: { lat: number; lng: number }[]) {
  if (!this.map || points.length < 2) return;

  if (this.polylineId) {
    await this.map.removePolylines([this.polylineId]);
    this.polylineId = undefined;
  }
  const ids = await this.map.addPolylines([
    {
      path: points,
      color: '#4285F4',
      width: 4,
    } as any, 
  ]);
  
  this.polylineId = ids[0]; 
  await this.map.setCamera({
    coordinate: points[0],
    zoom: 14,
  });
}

async drawRouteUsingGoogleAPI() {
  if (!this.map || !this.markers || this.markers.length < 2) {
    console.warn('Se necesitan al menos dos marcadores para dibujar una ruta.');
    return;
  }

  const origin = { lat: this.markers[0].lat, lng: this.markers[0].lng };
  const destination = {
    lat: this.markers[this.markers.length - 1].lat,
    lng: this.markers[this.markers.length - 1].lng,
  };

  try {
    const routePoints = await this.googleDirectionsService.getRoutePoints(origin, destination);

    if (!routePoints || routePoints.length === 0) {
      throw new Error('La ruta no devolvió puntos válidos.');
    }

    // Elimina cualquier línea previa si es necesario
    if (this.polylineId) {
      await this.map.removePolylines([this.polylineId]);
    }

    const ids = await this.map.addPolylines([
      {
        path: routePoints,
        color: '#4285F4',
        width: 4,
      } as any,
    ]);

    this.polylineId = ids[0];

    await this.map.setCamera({
      coordinate: routePoints[0],
      zoom: 14,
    });

  } catch (error) {
    console.error('Error al dibujar la ruta:', error);
  }
}




private async getDrawPolyline(points: { lat: number; lng: number }[]) {
  
  if (!this.map || points.length < 2) return;

  // Usa los primeros y últimos puntos como origen y destino
  const origin = `${points[0].lat},${points[0].lng}`;
  const destination = `${points[points.length - 1].lat},${points[points.length - 1].lng}`;
  const apiKey = 'AIzaSyBsnbQOBYbbUuDL2Dzpd_7D-wlXz-1B5bg'; // Reemplaza esto con tu clave de Google válida

  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}&mode=driving`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.routes.length === 0) return;

    const encodedPolyline = data.routes[0].overview_polyline.points;
    const decodedPath = this.decodePolyline(encodedPolyline);

    if (this.polylineId) {
      await this.map.removePolylines([this.polylineId]);
      this.polylineId = undefined;
    }

    const ids = await this.map.addPolylines([
      {
        path: decodedPath,
        color: '#4285F4',
        width: 4,
      } as any,
    ]);

    this.polylineId = ids[0];

    await this.map.setCamera({
      coordinate: decodedPath[0],
      zoom: 14,
    });
  } catch (err) {
    console.error('Error obteniendo ruta:', err);
  }
}

private decodePolyline(encoded: string): { lat: number; lng: number }[] {
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;
  const path = [];

  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const deltaLat = (result & 1) ? ~(result >> 1) : (result >> 1);
    lat += deltaLat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const deltaLng = (result & 1) ? ~(result >> 1) : (result >> 1);
    lng += deltaLng;

    path.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return path;
}


}
