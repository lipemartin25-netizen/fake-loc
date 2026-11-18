import {validateCoordinate,type Coordinate} from './geo';

export type FavoriteRecord={id:string,name:string,point:Coordinate,tags:string[],createdAt:string};
export type GpxPoint=Coordinate&{elevation?:number,time?:string,name?:string,description?:string};
export type GpxData={waypoints:GpxPoint[],routes:GpxPoint[][],trackSegments:GpxPoint[][]};
const MAX_FILE_CHARS=5_000_000,MAX_POINTS=50_000;
export function exportFavoritesJson(favorites:FavoriteRecord[]):string{return JSON.stringify({schemaVersion:1,favorites:favorites.map(f=>({id:f.id,name:f.name,latitude:f.point.latitude,longitude:f.point.longitude,tags:f.tags,createdAt:f.createdAt}))},null,2)}
export function importFavoritesJson(text:string):{favorites:FavoriteRecord[],rejected:number}{
 if(text.length>MAX_FILE_CHARS)throw new Error('Arquivo JSON excede o limite de 5 MB.');
 let value:unknown;try{value=JSON.parse(text)}catch{throw new Error('JSON malformado.')}
 if(!value||typeof value!=='object'||(value as {schemaVersion?:unknown}).schemaVersion!==1||!Array.isArray((value as {favorites?:unknown}).favorites))throw new Error('Schema JSON incompatível; esperado schemaVersion 1 e favorites.');
 const records=(value as {favorites:unknown[]}).favorites;const favorites:FavoriteRecord[]=[];let rejected=0;
 if(records.length>10_000)throw new Error('JSON excede o limite de 10.000 favoritos.');
 for(const item of records){try{if(!item||typeof item!=='object')throw 0;const v=item as Record<string,unknown>;if(typeof v.id!=='string'||!v.id||typeof v.name!=='string'||!v.name.trim()||v.name.length>160||!Number.isFinite(v.latitude)||!Number.isFinite(v.longitude))throw 0;const point=validateCoordinate({latitude:v.latitude as number,longitude:v.longitude as number});const createdAt=typeof v.createdAt==='string'&&Number.isFinite(Date.parse(v.createdAt))?new Date(v.createdAt).toISOString():new Date(0).toISOString();const tags=Array.isArray(v.tags)?v.tags.filter((x):x is string=>typeof x==='string').slice(0,50):[];favorites.push({id:v.id,name:v.name.trim(),point,tags,createdAt})}catch{rejected++}}
 return {favorites,rejected};
}
function pointElement(p:GpxPoint,tag:string):string{const attr=` lat="${p.latitude}" lon="${p.longitude}"`;return `<${tag}${attr}>${p.elevation!==undefined&&Number.isFinite(p.elevation)?`<ele>${p.elevation}</ele>`:''}${p.time?`<time>${escapeXml(p.time)}</time>`:''}${p.name?`<name>${escapeXml(p.name)}</name>`:''}${p.description?`<desc>${escapeXml(p.description)}</desc>`:''}</${tag}>`}
function escapeXml(v:string):string{return v.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&apos;')}
export function exportGpx(data:GpxData):string{return `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="Fake Loc" xmlns="http://www.topografix.com/GPX/1/1">${data.waypoints.map(p=>pointElement(p,'wpt')).join('')}${data.routes.map((r,i)=>`<rte><name>Rota ${i+1}</name>${r.map(p=>pointElement(p,'rtept')).join('')}</rte>`).join('')}${data.trackSegments.length?`<trk><name>Fake Loc track</name>${data.trackSegments.map(s=>`<trkseg>${s.map(p=>pointElement(p,'trkpt')).join('')}</trkseg>`).join('')}</trk>`:''}</gpx>`}
export function importGpx(text:string):GpxData{
 if(text.length>MAX_FILE_CHARS)throw new Error('Arquivo GPX excede o limite de 5 MB.');
 if(/<!DOCTYPE|<!ENTITY/i.test(text))throw new Error('GPX com DTD ou entidades não é permitido.');
 const doc=new DOMParser().parseFromString(text,'application/xml');if(doc.querySelector('parsererror'))throw new Error('XML GPX malformado.');
 const root=doc.documentElement;if(root.localName!=='gpx'||root.getAttribute('version')!=='1.1')throw new Error('Arquivo precisa ser GPX 1.1.');
 let count=0;const read=(el:Element):GpxPoint=>{if(++count>MAX_POINTS)throw new Error(`GPX excede ${MAX_POINTS} pontos.`);const lat=el.getAttribute('lat'),lon=el.getAttribute('lon');if(!lat?.trim()||!lon?.trim())throw new Error('Ponto GPX sem latitude ou longitude.');const latitude=Number(lat),longitude=Number(lon);const point: GpxPoint={...validateCoordinate({latitude,longitude})};const child=(n:string)=>Array.from(el.children).find(x=>x.localName===n)?.textContent?.trim();const ele=child('ele');if(ele!==undefined){const value=Number(ele);if(Number.isFinite(value))point.elevation=value}const time=child('time');if(time)point.time=time;const name=child('name');if(name)point.name=name;const description=child('desc');if(description)point.description=description;return point};
 const all=(parent:Element,name:string)=>Array.from(parent.children).filter(x=>x.localName===name);
 const waypoints=all(root,'wpt').map(read);const routes=all(root,'rte').map(r=>all(r,'rtept').map(read));const trackSegments=all(root,'trk').flatMap(t=>all(t,'trkseg').map(s=>all(s,'trkpt').map(read)));
 if(!waypoints.length&&!routes.some(x=>x.length)&&!trackSegments.some(x=>x.length))throw new Error('GPX não contém waypoints, rotas ou pontos de track suportados.');
 return {waypoints,routes,trackSegments};
}
