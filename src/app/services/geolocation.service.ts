import { Geolocation } from '@capacitor/geolocation'; // <--- Importa Geolocation
import { checkNetworkStatus } from '../shared/utils/checkNetworkStatus';
import { ToastService } from 'src/app/services/toast.service';
import { Injectable } from '@angular/core';
import { isMobileOrWebOperatingSystem } from '../shared/utils/isMobileOrWebOperatingSystem';
import { getDistanceFromLatLonInMeters } from '../shared/utils/getDistanceFromLatLonInMeters';
import { ObserverBetweenComponentsService } from './observer-between-components.services';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  constructor(
    private toastService: ToastService,
  private observerService: ObserverBetweenComponentsService) {}

  async getLocationWeb(): Promise<{
    latitude: number | '';
    longitude: number | '';
  }> {
    // alert('1==')

    const isConnected = await checkNetworkStatus();
    if (!isConnected) {
      this.toastService.presentToast(
        'No hay conexión a internet para obtener la ubicación.',
        'warning'
      );
      return {
        latitude: '',
        longitude: '',
      };
    }
    // alert('22==')

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
    // alert('33==')
        const text = 'Geolocation is not supported by this browser.'
        reject(new Error(text));
        this.toastService.presentToast(
          'Revise si tiene la ubicacion encendida o '+ text,
          'warning'
        );
        return; // Asegúrate de salir después de rechazar
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          // Mejorar el manejo de errores de la API web Geolocation
          let errorMessage = 'Failed to retrieve location.';
          if (error.code === error.PERMISSION_DENIED) {
            errorMessage = 'Permiso de ubicación denegado por el usuario.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMessage = 'Ubicación no disponible.';
          } else if (error.code === error.TIMEOUT) {
            errorMessage = 'Tiempo de espera agotado al obtener la ubicación.';
          }
          this.toastService.presentToast(
            'Revise si tiene la ubicacion encendida o '+ error,
            'warning'
          );
          return false;
          reject(new Error(errorMessage));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // Opciones para getCurrentPosition
      );
    });
  }

  // Método para solicitar permisos (solo para iOS/Android, en web se pide al usar)
  async requestGeolocationPermissions() {
    try {
      const permissionStatus = await Geolocation.requestPermissions();
      console.log(
        'Estado de los permisos de geolocalización:',
        permissionStatus.location
      );

      if (permissionStatus.location !== 'granted') {
        this.toastService.presentToast(
          'Por favor, concede permisos de ubicación para usar esta función.',
          'danger'
        );
      }
      return permissionStatus.location === 'granted';
    } catch (error: any) {
      // alert(JSON.stringify(error));
      console.error('Error al solicitar permisos de geolocalización:', error);
      console.log('Error al solicitar permisos de geolocalización:', error);
      this.toastService.presentToast(
        'Error al solicitar permisos de ubicación.',
        'danger'
      );
      return false;
    }
  }

  // Método para obtener la ubicación actual
  async getCurrentLocation() {
    // Primero, verifica/solicita permisos
    const isMobile = isMobileOrWebOperatingSystem();
    let hasPermission = false;
    // alert(isMobile)
    if (isMobile !== 'unknown') {
      hasPermission = await this.requestGeolocationPermissions();
    }

    if (!hasPermission) {
      // alert(1)
      const locationFromWeb: any = await this.getLocationWeb(); // <--- AWAIT AQUÍ
      if (locationFromWeb?.latitude !== '' && locationFromWeb?.longitude !== '') {
      // alert(2)
        this.toastService.presentToast(
          'Ubicación obtenida por API web.',
          'info'
        );
      // alert(3)

        return locationFromWeb; // Permisos 'simulados' y ubicación obtenida
      }
      // alert(4)
      return false;
    }
      // alert(5)

    try {
      this.toastService.presentToast(
        'Obteniendo ubicación...',
        'primary',
        2000
      ); // Muestra un mensaje temporal

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true, // Intenta obtener la mejor precisión posible
        timeout: 10000, // Tiempo máximo para esperar la ubicación (10 segundos)
        maximumAge: 0, // No usar una ubicación en caché, obtener una nueva
      });

      // this.currentLatitude = position.coords.latitude;
      // this.currentLongitude = position.coords.longitude;

      // // Actualiza los campos del formulario con la ubicación obtenida
      // this.parentForm.patchValue({
      //   partner_latitude: this.currentLatitude,
      //   partner_longitude: this.currentLongitude
      // });

      // console.log('Ubicación obtenida:', this.currentLatitude, this.currentLongitude);
      this.toastService.presentToast(
        'Ubicación obtenida correctamente.',
        'success'
      );
      return position;
    } catch (error: any) {
      console.error('Error al obtener la ubicación:', error);

      let errorMessage = 'No se pudo obtener la ubicación.';
      if (error.code === 1) {
        errorMessage =
          'Acceso a la ubicación denegado. Habilita los permisos en la configuración de tu dispositivo.';
      } else if (error.code === 2) {
        errorMessage =
          'Ubicación no disponible. Verifica que el GPS esté activo.';
      } else if (error.code === 3) {
        errorMessage =
          'Tiempo de espera agotado al intentar obtener la ubicación.';
      }

      this.toastService.presentToast(errorMessage, 'danger');
      return false;
    }
  }

  // Método para observar cambios de ubicación (si necesitas seguimiento en tiempo real)
  async startTrackingLocation111(watchId: any) {
      const isMobile = isMobileOrWebOperatingSystem();

      if (isMobile == 'unknown') {
      return;
    }
    const hasPermission = await this.requestGeolocationPermissions();
    if (!hasPermission) {
      return;
    }

    if (watchId) {
      // Si ya hay un observador, primero lo detenemos
      await this.stopTrackingLocation(watchId);
    }

    this.toastService.presentToast(
      'Iniciando seguimiento de ubicación...',
      'primary'
    );

    watchId = await Geolocation.watchPosition(
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
      (position, err) => {
        if (err) {
          console.error('Error en el seguimiento de ubicación:', err);
          this.toastService.presentToast(
            'Error en el seguimiento de ubicación.',
            'danger'
          );
          return;
        }
        if (position) {
          console.log('Nueva ubicación:', position);
          return position;
          // this.toastService.presentToast('Ubicación actualizada.', 'light', 1500); // Puedes mostrar esto o no, según el caso
        }
        return false;
      }
    );
  }

 async startTrackingLocation(): Promise<string | undefined> {
  const isMobile = isMobileOrWebOperatingSystem();
  if (isMobile === 'unknown') return;

  const hasPermission = await this.requestGeolocationPermissions();
  if (!hasPermission) return;
  const data = {
    watchId: localStorage.getItem('watchId') ?? null,
    lastPosition:  localStorage.getItem('trackingLocation') ?? null,
  }

  // Detener observador anterior si existe
  if (data.watchId) {
    await this.stopTrackingLocation(data.watchId);
  }

  let lastPosition: GeolocationPosition | any = data?.lastPosition ?? null;
  let lastMovementTime: number = Date.now();

  const DISTANCE_THRESHOLD_METERS = 10;
  const TIME_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutos

  const newWatchId = Geolocation.watchPosition(
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 200,
    },
    async (position, err) => {
      if (err || !position) {
        console.error('❌ Error obteniendo ubicación:', err);
        return;
      }

      const currentTime = Date.now();

      if (lastPosition) {
        const distance =await getDistanceFromLatLonInMeters(
          lastPosition.coords.latitude,
          lastPosition.coords.longitude,
          position.coords.latitude,
          position.coords.longitude
        );

        const timeStopped = currentTime - lastMovementTime;

        if (distance > DISTANCE_THRESHOLD_METERS) {
          console.log(`🚶‍♂️ Movimiento detectado: ${distance.toFixed(2)}m`);
          lastMovementTime = currentTime;
          this.observerService.changeDriverLocation(position); // ejemplo: empieza una carga
        } else if (timeStopped > TIME_THRESHOLD_MS) {
          console.warn('🛑 Usuario lleva más de 5 minutos sin moverse.');
        }

         this.observerService.changeMessage(position);
      } else {
        lastMovementTime = currentTime;
        console.log('📍 Primer dato de ubicación recibido.');
      }

      lastPosition = position;
      localStorage.setItem('trackingLocation', JSON.stringify(lastPosition))
      localStorage.setItem('watchId', JSON.stringify(newWatchId))
    }
  );
  return newWatchId;
}


  async startTrackingLocation4444(watchId: any): Promise<string | undefined> {
      const isMobile = isMobileOrWebOperatingSystem();

      if (isMobile == 'unknown') {
          console.error('Tipo de dispositivo es web:');

      return;
    }

    const hasPermission = await this.requestGeolocationPermissions();
    if (!hasPermission) {
      return;
    }

    if (watchId) {
      await this.stopTrackingLocation(watchId);
    }

    this.toastService.presentToast(
      'Iniciando seguimiento de ubicación...',
      'primary'
    );

    const newWatchId = Geolocation.watchPosition(
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
      (position, err) => {
        if (err) {
          console.error('Error en el seguimiento de ubicación:', err);
          this.toastService.presentToast(
            'Error en el seguimiento de ubicación.',
            'danger'
          );
          return;
        }

        if (position) {
           this.toastService.presentToast(
            'Nueva ubicación: lat'+
            position.coords.latitude+' lng'+
            position.coords.longitude
          );
          console.log(
            'Nueva ubicación:',
            position.coords.latitude,
            position.coords.longitude
          );
          // Aquí puedes actualizar alguna propiedad o emitir un evento
        }
      }
    );

    return newWatchId;
  }

  // Método para detener el observador de ubicación
  async stopTrackingLocation(watchId: any) {
    if (watchId) {
      await Geolocation.clearWatch({ id: watchId });
      watchId = null;
      this.toastService.presentToast(
        'Seguimiento de ubicación detenido.',
        'medium'
      );
      console.log('Seguimiento de ubicación detenido.');
    }
  }
}
