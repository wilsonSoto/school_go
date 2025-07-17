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

  private map!: GoogleMap;
  private markerIds: string[] = [];

  async ngAfterViewInit() {
    console.log(environment.googleMapsApiKey, 'environment.googleMapsApiKey');

    await this.createMap();
    await this.addMarkersFromInput();
  }

  // async ngOnChanges(changes: SimpleChanges) {
  //   if (changes['markers'] && !changes['markers'].firstChange && this.map) {
  //     await this.removeAllMarkers();
  //     await this.addMarkersFromInput();
  //   }
  // }

  async ngOnChanges(changes: SimpleChanges) {
    console.log(changes,'[[[[[[[[[[[[[[[[[[[[[[[[[[[www');

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
    }
  }
}

  private async createMap() {
    // Esperar hasta que el elemento exista físicamente en el DOM
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
      // apiKey: environment.googleMapsApiKey,
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
}
