export type Coordinate = { latitude: number; longitude: number };
export const EARTH_RADIUS_M = 6_371_008.8;
export function validateCoordinate(p: Coordinate): Coordinate {
  if (!Number.isFinite(p.latitude) || !Number.isFinite(p.longitude) || p.latitude < -90 || p.latitude > 90 || p.longitude < -180 || p.longitude > 180) throw new Error('Coordenada fora dos limites válidos.');
  return p;
}
export function parseCoordinate(lat: string, lon: string): Coordinate {
  if (!lat.trim() || !lon.trim()) throw new Error('Informe latitude e longitude.');
  const number = (s: string) => Number(s.trim().replace(',', '.'));
  return validateCoordinate({latitude:number(lat),longitude:number(lon)});
}
export function normalizeLongitude(lon: number): number { return ((lon + 180) % 360 + 360) % 360 - 180; }
export function initialBearing(a: Coordinate, b: Coordinate): number {
  validateCoordinate(a); validateCoordinate(b);
  const rad = Math.PI / 180, p1=a.latitude*rad, p2=b.latitude*rad, dl=normalizeLongitude(b.longitude-a.longitude)*rad;
  if (a.latitude===b.latitude && normalizeLongitude(b.longitude-a.longitude)===0) return 0;
  return (Math.atan2(Math.sin(dl)*Math.cos(p2),Math.cos(p1)*Math.sin(p2)-Math.sin(p1)*Math.cos(p2)*Math.cos(dl))*180/Math.PI+360)%360;
}
export function distanceMeters(a: Coordinate,b: Coordinate): number {
  validateCoordinate(a); validateCoordinate(b); const r=Math.PI/180, dlat=(b.latitude-a.latitude)*r, dlon=normalizeLongitude(b.longitude-a.longitude)*r;
  const h=Math.sin(dlat/2)**2+Math.cos(a.latitude*r)*Math.cos(b.latitude*r)*Math.sin(dlon/2)**2;
  return EARTH_RADIUS_M*2*Math.atan2(Math.sqrt(Math.min(1,h)),Math.sqrt(Math.max(0,1-h)));
}
export function interpolate(a: Coordinate,b: Coordinate,t: number): Coordinate {
  validateCoordinate(a); validateCoordinate(b); const f=Math.max(0,Math.min(1,t));
  const d=distanceMeters(a,b), bearing=initialBearing(a,b)*Math.PI/180;
  if (d===0) return {...a}; const p1=a.latitude*Math.PI/180, l1=a.longitude*Math.PI/180, ad=d*f/EARTH_RADIUS_M;
  const p2=Math.asin(Math.sin(p1)*Math.cos(ad)+Math.cos(p1)*Math.sin(ad)*Math.cos(bearing));
  const l2=l1+Math.atan2(Math.sin(bearing)*Math.sin(ad)*Math.cos(p1),Math.cos(ad)-Math.sin(p1)*Math.sin(p2));
  return {latitude:p2*180/Math.PI,longitude:normalizeLongitude(l2*180/Math.PI)};
}
export function projectCoordinate(origin: Coordinate, bearingDeg: number, distanceMeters: number): Coordinate {
  validateCoordinate(origin);
  if (!Number.isFinite(distanceMeters) || distanceMeters === 0) return { ...origin };
  const rad = Math.PI / 180;
  const p1 = origin.latitude * rad;
  const l1 = origin.longitude * rad;
  const arc = distanceMeters / EARTH_RADIUS_M;
  const bRad = ((bearingDeg % 360 + 360) % 360) * rad;
  const p2 = Math.asin(Math.sin(p1) * Math.cos(arc) + Math.cos(p1) * Math.sin(arc) * Math.cos(bRad));
  const l2 = l1 + Math.atan2(Math.sin(bRad) * Math.sin(arc) * Math.cos(p1), Math.cos(arc) - Math.sin(p1) * Math.sin(p2));
  return validateCoordinate({
    latitude: (p2 * 180) / Math.PI,
    longitude: normalizeLongitude((l2 * 180) / Math.PI),
  });
}
