import { Injectable } from '@angular/core';

declare var google: any;

@Injectable({
  providedIn: 'root',
})
export class GoogleDirectionsService {
  constructor() {}

  getRoutePolylineBetween(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }): Promise<{ lat: number; lng: number }[]> {
    return new Promise((resolve, reject) => {
      if (!google || !google.maps) {
        reject('Google Maps SDK no está cargado.');
        return;
      }

      const directionsService = new google.maps.DirectionsService();

      directionsService.route(
        {
          origin,
          destination,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result: any, status: any) => {
          if (status === google.maps.DirectionsStatus.OK) {
            const polyline = result.routes[0].overview_polyline;
            const decodedPath = google.maps.geometry.encoding.decodePath(polyline);

            const path = decodedPath.map((latLng: any) => ({
              lat: latLng.lat(),
              lng: latLng.lng(),
            }));

            resolve(path);
          } else {
            reject(`No se pudo obtener la ruta: ${status}`);
          }
        }
      );
    });
  }

  // 🚗 Ruta completa por tramos consecutivos
  async getRoutePolyline(points: { lat: number; lng: number }[]): Promise<{ lat: number; lng: number }[]> {
    const fullPath: { lat: number; lng: number }[] = [];

    for (let i = 0; i < points.length - 1; i++) {
      try {
        const segmentPath = await this.getRoutePolylineBetween(points[i], points[i + 1]);
        if (i > 0) segmentPath.shift(); // evita repetir el punto anterior
        fullPath.push(...segmentPath);
      } catch (err) {
        console.error(`Error en tramo ${i} → ${i + 1}:`, err);
      }
    }

    return fullPath;
  }
}
