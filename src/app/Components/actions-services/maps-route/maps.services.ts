// import { Injectable } from '@angular/core';

// @Injectable({
//     providedIn: 'root',
//   })
//   export class GoogleMapsLoaderService {
//     private isLoaded = false;

//     load(apiKey: string): Promise<void> {
//       return new Promise((resolve, reject) => {
//         if (this.isLoaded) {
//           resolve();
//           return;
//         }

//         const script = document.createElement('script');
//         script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
//         script.async = true;
//         script.defer = true;

//         script.onload = () => {
//           this.isLoaded = true;
//           resolve();
//         };

//         script.onerror = (error) => reject(error);

//         document.head.appendChild(script);
//       });
//     }
//   }
