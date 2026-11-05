import {expect,it} from 'vitest';
import {distanceMeters,initialBearing,interpolate,parseCoordinate,projectCoordinate} from './geo';
it('parses pt-BR decimal comma and validates limits',()=>{expect(parseCoordinate('-23,55','-46,63')).toEqual({latitude:-23.55,longitude:-46.63});expect(()=>parseCoordinate('','0')).toThrow();expect(()=>parseCoordinate('90.01','0')).toThrow();});
it('measures São Paulo to Rio on a sphere',()=>{const d=distanceMeters({latitude:-23.5505,longitude:-46.6333},{latitude:-22.9068,longitude:-43.1729});expect(d).toBeGreaterThan(360000);expect(d).toBeLessThan(361000);});
it('handles identical points and short antimeridian path',()=>{const a={latitude:0,longitude:179.9},b={latitude:0,longitude:-179.9};expect(distanceMeters(a,a)).toBe(0);expect(distanceMeters(a,b)).toBeLessThan(23000);expect(initialBearing(a,b)).toBeCloseTo(90,0);expect(Math.abs(interpolate(a,b,.5).longitude)).toBeCloseTo(180,1);});
it('projects coordinates along bearing and distance with antimeridian crossing',()=>{
  const start = {latitude: 0, longitude: 0};
  const north = projectCoordinate(start, 0, 111195); // ~1 degree of latitude
  expect(north.latitude).toBeCloseTo(1, 1);
  expect(north.longitude).toBeCloseTo(0, 4);

  const east = projectCoordinate(start, 90, 111195); // ~1 degree of longitude at equator
  expect(east.latitude).toBeCloseTo(0, 4);
  expect(east.longitude).toBeCloseTo(1, 1);

  // Zero distance identity
  expect(projectCoordinate(start, 45, 0)).toEqual(start);

  // Antimeridian crossing towards East
  const nearEdge = {latitude: 0, longitude: 179.99};
  const crossed = projectCoordinate(nearEdge, 90, 3000); // 3 km East
  expect(crossed.longitude).toBeLessThan(0); // Wrapped around to negative
});
