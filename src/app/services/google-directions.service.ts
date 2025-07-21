import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GoogleDirectionsService {
  private apiKey = 'AIzaSyBsnbQOBYbbUuDL2Dzpd_7D-wlXz-1B5bg'; // <-- reemplaza con tu clave real

  constructor(private http: HttpClient) {}

  /**
   * Devuelve una lista de coordenadas (lat, lng) representando una ruta entre dos puntos
   */
  async getRoutePoints(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  )
  : Promise<{ lat: number; lng: number }[]> 
  {
    const originStr = `${origin.lat},${origin.lng}`;
    const destStr = `${destination.lat},${destination.lng}`;

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destStr}&key=${this.apiKey}&mode=driving`;

    console.log('Consultando ruta:', url);

    try {
      const response: any = await firstValueFrom(this.http.get(url));

      if (
        response.routes &&
        response.routes.length > 0 &&
        response.routes[0].overview_polyline
      ) {
        const encodedPath = response.routes[0].overview_polyline.points;
        return this.decodePolyline(encodedPath);
      } else {
        throw new Error('No se encontró una ruta válida.');
      }
    } catch (error) {
      console.error('Error obteniendo ruta:', error);
      throw error;
    }
  }

  /**
   * Decodifica un string polyline de Google en una lista de puntos lat/lng
   */
  private decodePolyline(encoded: string): { lat: number; lng: number }[] {
    let points: { lat: number; lng: number }[] = [];
    let index = 0, lat = 0, lng = 0;

    while (index < encoded.length) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = (result & 1) ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = (result & 1) ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({ lat: lat / 1e5, lng: lng / 1e5 });
    }

    return points;
  }
}
