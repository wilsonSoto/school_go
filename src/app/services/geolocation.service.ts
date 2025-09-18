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

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
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
        'Estado de los permisos de geolocalización: ********************************************************************************************************************************',
        permissionStatus.location
      );

      if (permissionStatus.location !== 'granted') {
        this.toastService.presentToast(
          'Por favor, concede permisos de ubicación para usar esta función. ',
          'danger'
        );
      }
      return permissionStatus.location === 'granted';
    } catch (error: any) {
      console.error('Error al solicitar permisos de geolocalización: ---------------------------------------------------------------------------------------------------------------------------------------------------------', error);
      console.log('Error al solicitar permisos de geolocalización-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------:', error);
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
    if (isMobile !== 'unknown') {
      hasPermission = await this.requestGeolocationPermissions();
    }

    if (!hasPermission) {
      const locationFromWeb: any = await this.getLocationWeb(); // <--- AWAIT AQUÍ
      if (locationFromWeb?.latitude !== '' && locationFromWeb?.longitude !== '') {
        this.toastService.presentToast(
          'Ubicación obtenida por API web.',
          'info'
        );

        return locationFromWeb; // Permisos 'simulados' y ubicación obtenida
      }
      return false;
    }

    try {
      this.toastService.presentToast(
        'Obteniendo ubicación...',
        'primary',
        2000
      ); // Muestra un mensaje temporal

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true, // Intenta obtener la mejor precisión posible
        timeout: 30000, // Tiempo máximo para esperar la ubicación (10 segundos)
        maximumAge: 0, // No usar una ubicación en caché, obtener una nueva
      });

      this.toastService.presentToast(
        'Ubicación obtenida correctamente.',
        'success'
      );
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }//position.coords ?? position;
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
  // async startTrackingLocation111(watchId: any) {
  //     const isMobile = isMobileOrWebOperatingSystem();

  //     if (isMobile == 'unknown') {
  //     return;
  //   }
  //   const hasPermission = await this.requestGeolocationPermissions();
  //   if (!hasPermission) {
  //     return;
  //   }

  //   if (watchId) {
  //     // Si ya hay un observador, primero lo detenemos
  //     await this.stopTrackingLocation(watchId);
  //   }

  //   this.toastService.presentToast(
  //     'Iniciando seguimiento de ubicación...',
  //     'primary'
  //   );

  //   watchId = await Geolocation.watchPosition(
  //     {
  //       enableHighAccuracy: true,
  //       timeout: 10000,
  //       maximumAge: 0,
  //     },
  //     (position, err) => {
  //       if (err) {
  //         console.error('Error en el seguimiento de ubicación:', err);
  //         this.toastService.presentToast(
  //           'Error en el seguimiento de ubicación.',
  //           'danger'
  //         );
  //         return;
  //       }
  //       if (position) {
  //         console.log('Nueva ubicación:', position);
  //         return position;
  //         // this.toastService.presentToast('Ubicación actualizada.', 'light', 1500); // Puedes mostrar esto o no, según el caso
  //       }
  //       return false;
  //     }
  //   );
  // }

 async startTrackingLocation8888888888888888(): Promise<string | undefined> {
 console.log('📡 Iniciando startTrackingLocation  1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111');

//  alert(1)
 const isMobile = isMobileOrWebOperatingSystem();
  if (isMobile === 'unknown') return;
//  alert(2)

console.log('📱 Tipo de dispositivo: 222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222', isMobile);
  const hasPermission = await this.requestGeolocationPermissions();
  if (!hasPermission) return;
//  alert(3)

  console.warn('⛔ No se otorgaron permisos 33333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333');
  const data = {
    watchId: JSON.parse(localStorage.getItem('watchId') || 'null') ?? null,
    lastPosition:  localStorage.getItem('trackingLocation') ?? null,
  }
//  alert(4)

  // Detener observador anterior si existe
  if (data.watchId) {
//  alert(5)

    await this.stopTrackingLocation(data.watchId);
  }
//  alert(6)

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
        this.toastService.presentToast('Error obteniendo ubicación');
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
 alert(7)

  return newWatchId;
}
// import { Geolocation } from '@capacitor/geolocation';

async  startTrackingLocation() {
  try {
    console.log('📍 Solicitando permisos...');
    const perm = await Geolocation.requestPermissions();

    if (perm.location !== 'granted') {
      console.warn('🚫 Permiso de ubicación no otorgado.');
      return;
    }

    console.log('✅ Permiso otorgado. Iniciando watchPosition...');

    const watchId = Geolocation.watchPosition(
      {
        enableHighAccuracy: true,
        timeout: 10000, // 10 segundos
        maximumAge: 0,
      },
      (position, error) => {
        if (error) {
          console.error('❌ Error obteniendo ubicación:', error.message);
          return;
        }

        if (position) {
          this.observerService.changeDriverLocation(position); // ejemplo: empieza una carga

          console.log('📡 Posición actual:', position.coords);
          // Aquí podrías emitir la posición
          // this.observerService.changeDriverLocation(position);
        }
      }
    );

    console.log('🆔 ID del watchPosition:', watchId);
    return watchId;
  } catch (error) {
    console.error('❌ Error en startTrackingLocation:', error);
    return error
  }
}


  // async startTrackingLocation4444(watchId: any): Promise<string | undefined> {
  //     const isMobile = isMobileOrWebOperatingSystem();

  //     if (isMobile == 'unknown') {
  //         console.error('Tipo de dispositivo es web:');

  //     return;
  //   }

  //   const hasPermission = await this.requestGeolocationPermissions();
  //   if (!hasPermission) {
  //     return;
  //   }

  //   if (watchId) {
  //     await this.stopTrackingLocation(watchId);
  //   }

  //   this.toastService.presentToast(
  //     'Iniciando seguimiento de ubicación...',
  //     'primary'
  //   );

  //   const newWatchId = Geolocation.watchPosition(
  //     {
  //       enableHighAccuracy: true,
  //       timeout: 10000,
  //       maximumAge: 0,
  //     },
  //     (position, err) => {
  //       if (err) {
  //         console.error('Error en el seguimiento de ubicación:', err);
  //         this.toastService.presentToast(
  //           'Error en el seguimiento de ubicación.',
  //           'danger'
  //         );
  //         return;
  //       }

  //       if (position) {
  //          this.toastService.presentToast(
  //           'Nueva ubicación: lat'+
  //           position.coords.latitude+' lng'+
  //           position.coords.longitude
  //         );
  //         console.log(
  //           'Nueva ubicación:',
  //           position.coords.latitude,
  //           position.coords.longitude
  //         );
  //         // Aquí puedes actualizar alguna propiedad o emitir un evento
  //       }
  //     }
  //   );

  //   return newWatchId;
  // }

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


simulateMovement(startLat: number, startLng: number, intervalMs = 15000) {
  let currentLat = startLat;
  let currentLng = startLng;

  const move = () => {
    const distanceMeters = 1000;

    // Sumar 100 metros al norte
    const deltaLat = distanceMeters / 111320; // ~0.000899

    currentLat += deltaLat;

    const fakeCoords: GeolocationCoordinates = {
      latitude: currentLat,
      longitude: currentLng,
      accuracy: 5,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
      toJSON: () => ({
        latitude: currentLat,
        longitude: currentLng,
        accuracy: 5,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null
      })
    };

    const fakePosition: GeolocationPosition = {
      coords: fakeCoords,
      timestamp: Date.now(),
      toJSON: () => ({ coords: fakeCoords, timestamp: Date.now() })
    };

    console.log(fakePosition, 'fakePosition');

    this.observerService.changeDriverLocation(fakePosition);
  };

  setInterval(move, intervalMs);
}

simulateMovementToMarkers(
  startLat: number,
  startLng: number,
  targets: { lat: number; lng: number; id?: any }[],
  stepMeters = 500,
  intervalMs = 2000
) {
  if (!targets || targets.length === 0) {
    console.warn('⚠️ No hay destinos para simular.');
    return;
  }

  let currentLat = startLat;
  let currentLng = startLng;
  let targetIndex = 0;

  const move = () => {
    if (targetIndex >= targets.length) {
      console.log('✅ Chofer llegó a todos los destinos.');
      return;
    }

    const target = targets[targetIndex];
    const { lat: destLat, lng: destLng } = target;

    // Calcular vector dirección
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const toDeg = (rad: number) => (rad * 180) / Math.PI;

    const R = 6371000; // radio Tierra en metros
    const φ1 = toRad(currentLat);
    const λ1 = toRad(currentLng);
    const φ2 = toRad(destLat);
    const λ2 = toRad(destLng);

    const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
    const x =
      Math.cos(φ1) * Math.sin(φ2) -
      Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
    const bearing = Math.atan2(y, x);

    // Calcular siguiente punto
    const distRatio = stepMeters / R;
    const φ3 = Math.asin(
      Math.sin(φ1) * Math.cos(distRatio) +
        Math.cos(φ1) * Math.sin(distRatio) * Math.cos(bearing)
    );
    const λ3 =
      λ1 +
      Math.atan2(
        Math.sin(bearing) * Math.sin(distRatio) * Math.cos(φ1),
        Math.cos(distRatio) - Math.sin(φ1) * Math.sin(φ3)
      );

    const nextLat = toDeg(φ3);
    const nextLng = toDeg(λ3);

    currentLat = nextLat;
    currentLng = nextLng;

    // Calcular distancia restante
    const distance = this.getDistanceMeters(currentLat, currentLng, destLat, destLng);

    // Crear posición simulada
    const fakeCoords: GeolocationCoordinates = {
      latitude: currentLat,
      longitude: currentLng,
      accuracy: 5,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
      toJSON: () => ({
        latitude: currentLat,
        longitude: currentLng,
        accuracy: 5,
      }),
    };

    const fakePosition: GeolocationPosition = {
      coords: fakeCoords,
      timestamp: Date.now(),
      toJSON: () => ({ coords: fakeCoords, timestamp: Date.now() }),
    };

    this.observerService.changeDriverLocation(fakePosition);

    console.log(
      `🚌 Moviéndose hacia destino ${targetIndex + 1}: distancia restante ${distance.toFixed(
        2
      )}m`
    );

    // Si llegamos a menos de 10 metros, pasamos al siguiente
    if (distance < 10) {
      console.log(`🎯 Llegó al destino ${targetIndex + 1}`);
      targetIndex++;
    }

    if (targetIndex < targets.length) {
      setTimeout(move, intervalMs);
    } else {
      console.log('🏁 Chofer llegó a todos los puntos.');
    }
  };

  move();
}

// Utilidad para calcular distancia
private getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

}
