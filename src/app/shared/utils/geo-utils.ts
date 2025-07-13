// src/app/utils/geo-utils.ts

export interface LatLon {
  lat: number;
  lon: number;
}

/**
 * Parsea una cadena WKT de tipo POINT y devuelve { lat, lon }.
 * @param wkt Ej: "POINT (-69.9826390 18.5214240)"
 */
export function parseWKTPoint(wkt: string): LatLon | null {
  const match = wkt.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
  if (!match) return null;

  return {
    lon: parseFloat(match[1]),
    lat: parseFloat(match[2]),
  };
}

/**
 * Calcula el centroide de un arreglo de puntos WKT
 * @param wktArray Array de strings en formato WKT
 */
export function getCentroid(wktArray: string[]): LatLon | null {
  const points = wktArray
    .map(parseWKTPoint)
    .filter((p): p is LatLon => p !== null);

  if (points.length === 0) return null;

  const sum = points.reduce(
    (acc, curr) => {
      acc.lat += curr.lat;
      acc.lon += curr.lon;
      return acc;
    },
    { lat: 0, lon: 0 }
  );

  return {
    lat: sum.lat / points.length,
    lon: sum.lon / points.length,
  };
}
