import { Injectable } from '@angular/core';
import { ReplaySubject, Observable } from 'rxjs';

declare global {
  interface Window {
    google: any;
    initMapCallback?: () => void; // <<< MAKE IT OPTIONAL HERE by adding '?'
  }
}

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsLoaderService {
  private scriptLoadingPromise: Promise<void> | null = null;
  private apiLoaded = new ReplaySubject<boolean>(1);

  /**
   * Loads the Google Maps JavaScript API script.
   * Returns a Promise that resolves when the API is loaded.
   * Ensures the script is only loaded once.
   * @param apiKey Your Google Maps API Key.
   * @param libraries Optional: A comma-separated list of additional libraries to load (e.g., 'places,geometry').
   */
  load(apiKey: string, libraries: string = 'places'): Promise<void> {
    if (this.scriptLoadingPromise) {
      return this.scriptLoadingPromise;
    }

    this.scriptLoadingPromise = new Promise<void>((resolve, reject) => {
      // Check if Google Maps API is already loaded
      if (typeof window.google !== 'undefined' && typeof window.google.maps !== 'undefined') {
        this.apiLoaded.next(true);
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libraries}&callback=initMapCallback`;
      script.async = true;
      script.defer = true;

      window.initMapCallback = () => {
        this.apiLoaded.next(true);
        resolve();
        window.initMapCallback = undefined; // <<< CHANGE TO SET TO UNDEFINED
      };

      script.onerror = (error) => {
        this.apiLoaded.error(false);
        reject(new Error('Google Maps script could not be loaded: ' + error));
      };

      document.body.appendChild(script);
    });

    return this.scriptLoadingPromise;
  }

  /**
   * Returns an Observable that emits true when the API is loaded.
   * Can be used to react to the API being ready.
   */
  whenApiLoaded(): Observable<boolean> {
    return this.apiLoaded.asObservable();
  }
}
