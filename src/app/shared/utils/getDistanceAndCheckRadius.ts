/**
 * Verifica si un punto (lat2, lng2) está dentro del radio desde el punto base (lat1, lng1)
 * y devuelve la distancia en metros y si está dentro del área.
 */
export function getDistanceAndCheckRadius(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  radiusInMeters: number = 20
): { isInside: boolean; distance: number } {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;

  return {
    isInside: distance <= radiusInMeters,
    distance: distance // en metros
  };
}
