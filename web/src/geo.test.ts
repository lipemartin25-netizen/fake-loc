import {expect,it} from 'vitest';
import {distanceMeters,initialBearing,interpolate,parseCoordinate} from './geo';
it('parses pt-BR decimal comma and validates limits',()=>{expect(parseCoordinate('-23,55','-46,63')).toEqual({latitude:-23.55,longitude:-46.63});expect(()=>parseCoordinate('','0')).toThrow();expect(()=>parseCoordinate('90.01','0')).toThrow();});
it('measures São Paulo to Rio on a sphere',()=>{const d=distanceMeters({latitude:-23.5505,longitude:-46.6333},{latitude:-22.9068,longitude:-43.1729});expect(d).toBeGreaterThan(360000);expect(d).toBeLessThan(361000);});
it('handles identical points and short antimeridian path',()=>{const a={latitude:0,longitude:179.9},b={latitude:0,longitude:-179.9};expect(distanceMeters(a,a)).toBe(0);expect(distanceMeters(a,b)).toBeLessThan(23000);expect(initialBearing(a,b)).toBeCloseTo(90,0);expect(Math.abs(interpolate(a,b,.5).longitude)).toBeCloseTo(180,1);});
