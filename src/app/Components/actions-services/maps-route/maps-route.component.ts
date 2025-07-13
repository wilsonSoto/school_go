import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

interface MapMarker {
  lat: number;
  lng: number;
  popupText?: string;
}

@Component({
  standalone: true,
  selector: 'app-maps',
  templateUrl: './maps-route.component.html',
  styleUrls: ['./maps-route.component.scss'],
  imports: [CommonModule, IonicModule],
})
export class MapsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  @Input() markers: MapMarker[] = [];
  @Input() routePlanned: boolean = false;

  showMap: boolean = true;
  private map!: L.Map;
  private markerLayerGroup!: L.LayerGroup;

  ngAfterViewInit(): void {
    // if (this.mapContainer?.nativeElement) {
    //   // this.initMap();
    // } else {
    //   console.error('Map container not found!');
    // }
  }

    ngOnInit(): void {
      this.initMap();
    // if (this.mapContainer?.nativeElement) {
    // } else {
    //   console.error('Map container not found!');
    // }
  }

  initMap() {
    const mymap = L.map('mapid').setView([18.510360147613223, -69.86078075732146], 13);
    console.log(mymap,';mymap mymapmymapmymapmymapmymapmymapmymapmymapmymapmymapmymapmymap;');

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mymap);

    }

  private initMap1(): void {
    const element = this.mapContainer.nativeElement;
    console.log(element,';;');

    this.map = L.map(element).setView([18.510360147613223, -69.86078075732146], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.markerLayerGroup = L.layerGroup().addTo(this.map);

    setTimeout(() => {
      this.map.invalidateSize();
      // this.addMarkers();
    }, 100);
  }

  private addMarkers(): void {
    if (!this.markerLayerGroup) return;

    this.markerLayerGroup.clearLayers();

    this.markers.forEach(marker => {
      const leafletMarker = L.marker([marker.lat, marker.lng]);

      if (marker.popupText) {
        leafletMarker.bindPopup(marker.popupText);
      }

      leafletMarker.addTo(this.markerLayerGroup);
    });

    if (this.markers.length > 0) {
      const bounds = L.latLngBounds(this.markers.map(m => [m.lat, m.lng]));
      this.map.fitBounds(bounds, { padding: [20, 20] });
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }
}
