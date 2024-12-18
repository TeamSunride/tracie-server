import { RADIUS_OF_EARTH } from './constants';

export function degToRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): { dx: number; dy: number } {
  const R = RADIUS_OF_EARTH; // Radius of the Earth in meters
  const dLat = degToRad(lat2 - lat1);
  const dLon = degToRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degToRad(lat1)) *
      Math.cos(degToRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in meters

  // Convert distance to dx and dy components
  const dx = distance * Math.cos(degToRad(lat1));
  const dy = distance * Math.sin(degToRad(lat1));

  return { dx, dy };
}
