import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {SupabaseCloud} from './cloud';

beforeEach(()=>localStorage.clear());
afterEach(()=>{vi.restoreAllMocks()});

it('signs in, uploads local favorites, and merges rows returned by RLS',async()=>{
  const requests:Array<{url:string;init:RequestInit}> = [];
  const fetcher:typeof fetch=async(input,init={})=>{
    const url=String(input);requests.push({url,init});
    if(url.includes('/auth/v1/token?grant_type=password'))return Response.json({access_token:'user-jwt',refresh_token:'refresh',expires_in:3600,user:{id:'user-1',email:'test@example.com'}});
    if(url.endsWith('/rest/v1/favorites?on_conflict=id'))return new Response(null,{status:204});
    if(url.includes('/rest/v1/favorites?select='))return Response.json([{id:'remote',user_id:'user-1',name:'Remoto',latitude:-22,longitude:-43,tags:[],created_at:'2026-01-01T00:00:00.000Z',updated_at:'2026-01-02T00:00:00.000Z'}]);
    throw new Error(`Unexpected request ${url}`);
  };
  const cloud=new SupabaseCloud(fetcher,{url:'https://sample.supabase.co',publishableKey:'sb_publishable_test'});
  const session=await cloud.signIn('test@example.com','not-persisted');
  const merged=await cloud.syncFavorites([{id:'local',name:'Local',point:{latitude:-23,longitude:-46},tags:[],createdAt:'2026-01-01T00:00:00.000Z'}]);
  expect(merged.map(f=>f.id).sort()).toEqual(['local','remote']);
  expect(JSON.parse(localStorage.getItem('fake-loc-supabase-session-v1')||'{}').user.id).toBe('user-1');
  const uploaded=JSON.parse(String(requests[1].init.body));
  expect(uploaded[0]).toMatchObject({id:'local',user_id:'user-1',latitude:-23,longitude:-46});
  expect((requests[1].init.headers as Headers).get('Authorization')).toBe(`Bearer ${session.access_token}`);
  expect(localStorage.getItem('fake-loc-supabase-session-v1')).not.toContain('not-persisted');
});

it('refreshes an expired session and reports provider failures',async()=>{
  localStorage.setItem('fake-loc-supabase-session-v1',JSON.stringify({access_token:'expired',refresh_token:'refresh',expires_at:1,user:{id:'user-1'}}));
  const refreshCalls:string[]=[];
  const fetcher:typeof fetch=async(input)=>{const url=String(input);refreshCalls.push(url);if(url.includes('grant_type=refresh_token'))return Response.json({access_token:'new-token',refresh_token:'new-refresh',expires_in:3600,user:{id:'user-1'}});return Response.json([])};
  const cloud=new SupabaseCloud(fetcher,{url:'https://sample.supabase.co',publishableKey:'sb_publishable_test'});
  await expect(cloud.syncFavorites([])).resolves.toEqual([]);
  expect(refreshCalls[0]).toContain('grant_type=refresh_token');
  expect(localStorage.getItem('fake-loc-supabase-session-v1')).toContain('new-token');
  const failing=new SupabaseCloud(async()=>Response.json({msg:'E-mail ou senha inválidos.'},{status:400}),{url:'https://sample.supabase.co',publishableKey:'sb_publishable_test'});
  await expect(failing.signIn('test@example.com','bad')).rejects.toThrow('E-mail ou senha inválidos.');
});
