// // declare namespace google {
// //     export = google;
// // }

// // Correct way to declare a global namespace for Google Maps or other Google APIs.
// // This tells TypeScript about the existence and structure of the global 'google' object.
// declare namespace google {
//   // Add the 'maps' sub-namespace here. This is crucial for @capacitor/google-maps
//   // as its interfaces (PolygonOptions, CircleOptions, etc.) extend from google.maps.* types.
//   namespace maps {
//     // You typically don't need to define every single class/interface here if
//     // @types/google.maps is installed, as that package provides the full definitions.
//     // However, explicitly declaring the 'maps' namespace ensures it's recognized.
//     // If you were *not* using @types/google.maps, you would define types like:
//     // class Map { ... }
//     // interface MapOptions { ... }
//     // etc.
//     // Since you are using @types/google.maps, this empty declaration is often enough
//     // to "anchor" the 'maps' namespace for TypeScript.
//   }

//   // You can fill in the specific types as needed based on the Google API you are using.
//   // For a basic declaration to avoid the initial error, just having `declare namespace google {}` is enough.
// }
