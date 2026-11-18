import {act} from 'react';
import {createRoot,Root} from 'react-dom/client';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import App from './App';

let host:HTMLDivElement; let root:Root;
beforeEach(()=>{Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});localStorage.clear();host=document.createElement('div');document.body.append(host);root=createRoot(host);});
afterEach(()=>{act(()=>root.unmount());host.remove();vi.restoreAllMocks();});

it('rejects empty coordinate input instead of converting it to zero',()=>{
 act(()=>root.render(<App/>));
 const latitude=host.querySelector('input')!;
 act(()=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(latitude,'');latitude.dispatchEvent(new Event('input',{bubbles:true}));latitude.dispatchEvent(new Event('change',{bubbles:true}));});
 act(()=>[...host.querySelectorAll('button')].find(x=>x.textContent==='Definir destino')!.click());
 expect(host.querySelector('[role="alert"]')?.textContent).toContain('Informe latitude e longitude');
});

it('persists a favorite locally and makes it selectable',()=>{
 vi.spyOn(window,'prompt').mockReturnValue('Casa');
 act(()=>root.render(<App/>));
 act(()=>[...host.querySelectorAll('button')].find(x=>x.textContent?.includes('Salvar destino como favorito'))!.click());
 expect(host.textContent).toContain('Casa');
 expect(JSON.parse(localStorage.getItem('fake-loc-favorites-v1')||'[]')).toHaveLength(1);
});

it('pauses movement without advancing the simulated coordinate',()=>{
 vi.useFakeTimers();
 act(()=>root.render(<App/>));
 const setInput=(input:HTMLInputElement,value:string)=>{act(()=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(input,value);input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}))})};
 const inputs=host.querySelectorAll('input');setInput(inputs[0],'-22,9068');setInput(inputs[1],'-43,1729');
 act(()=>[...host.querySelectorAll('button')].find(x=>x.textContent==='Definir destino')!.click());
 act(()=>[...host.querySelectorAll('button')].find(x=>x.textContent==='Iniciar')!.click());
 act(()=>vi.advanceTimersByTime(1_000));
 const position=()=>host.querySelector('.coordbadge')?.textContent;
 const moved=position();expect(moved).not.toBe('-23.55050, -46.63330');
 act(()=>[...host.querySelectorAll('button')].find(x=>x.textContent==='Pausar')!.click());
 act(()=>vi.advanceTimersByTime(5_000));expect(position()).toBe(moved);
 vi.useRealTimers();
});

it('teleports the internal position to a validated destination',()=>{
 act(()=>root.render(<App/>));const inputs=host.querySelectorAll('input');
 const setInput=(input:HTMLInputElement,value:string)=>act(()=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(input,value);input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}))});
 setInput(inputs[0],'-22,9068');setInput(inputs[1],'-43,1729');
 act(()=>[...host.querySelectorAll('button')].find(x=>x.textContent==='Definir destino')!.click());
 act(()=>[...host.querySelectorAll('button')].find(x=>x.textContent==='Teleportar posição interna para destino')!.click());
 expect(host.querySelector('.coordbadge')?.textContent).toBe('-22.90680, -43.17290');
});
