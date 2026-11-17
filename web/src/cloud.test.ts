import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SupabaseCloud } from './cloud';

describe('SupabaseCloud Integration & Sync Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('signs in, uploads local favorites, and merges rows returned by RLS', async () => {
    const requests: Array<{ url: string; init: RequestInit }> = [];
    const fetcher: typeof fetch = async (input, init = {}) => {
      const url = String(input);
      requests.push({ url, init });
      if (url.includes('/auth/v1/token?grant_type=password')) {
        return Response.json({
          access_token: 'user-jwt-1',
          refresh_token: 'refresh-1',
          expires_in: 3600,
          user: { id: 'user-1', email: 'user1@example.com' },
        });
      }
      if (url.endsWith('/rest/v1/favorites?on_conflict=id')) {
        return new Response(null, { status: 204 });
      }
      if (url.includes('/rest/v1/favorites?select=')) {
        return Response.json([
          {
            id: 'remote-fav-1',
            user_id: 'user-1',
            name: 'Remoto 1',
            latitude: -22.9,
            longitude: -43.1,
            tags: ['praia'],
            created_at: '2026-01-01T00:00:00.000Z',
            updated_at: '2026-01-02T00:00:00.000Z',
          },
        ]);
      }
      throw new Error(`Unexpected request ${url}`);
    };

    const cloud = new SupabaseCloud(fetcher, { url: 'https://sample.supabase.co', publishableKey: 'sb_pub_test' });
    const session = await cloud.signIn('user1@example.com', 'secret-pwd');

    const merged = await cloud.syncFavorites([
      {
        id: 'local-fav-1',
        name: 'Local 1',
        point: { latitude: -23.5, longitude: -46.6 },
        tags: [],
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ]);

    expect(merged.map((f) => f.id).sort()).toEqual(['local-fav-1', 'remote-fav-1']);
    expect(JSON.parse(localStorage.getItem('fake-loc-supabase-session-v1') || '{}').user.id).toBe('user-1');

    const uploadCall = requests.find((r) => r.url.includes('/rest/v1/favorites?on_conflict=id'));
    expect(uploadCall).toBeDefined();
    const uploaded = JSON.parse(String(uploadCall!.init.body));
    expect(uploaded[0]).toMatchObject({ id: 'local-fav-1', user_id: 'user-1', latitude: -23.5, longitude: -46.6 });
    expect((uploadCall!.init.headers as Headers).get('Authorization')).toBe(`Bearer ${session.access_token}`);
  });

  it('rejects unauthenticated sync when no session is present', async () => {
    const cloud = new SupabaseCloud(vi.fn(), { url: 'https://sample.supabase.co', publishableKey: 'sb_pub_test' });
    await expect(cloud.syncFavorites([])).rejects.toThrow('Entre na sua conta Fake Loc para sincronizar.');
  });

  it('deletes directly on remote when session is active', async () => {
    localStorage.setItem(
      'fake-loc-supabase-session-v1',
      JSON.stringify({
        access_token: 'valid-jwt',
        refresh_token: 'refresh',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        user: { id: 'user-1' },
      })
    );

    const requests: Array<{ url: string; method?: string }> = [];
    const fetcher: typeof fetch = async (input, init = {}) => {
      requests.push({ url: String(input), method: init.method });
      if (String(input).includes('/rest/v1/favorites?id=eq.fav-to-delete')) {
        return new Response(null, { status: 204 });
      }
      throw new Error(`Unexpected request ${String(input)}`);
    };

    const cloud = new SupabaseCloud(fetcher, { url: 'https://sample.supabase.co', publishableKey: 'sb_pub_test' });
    await cloud.deleteFavorite('fav-to-delete');

    expect(requests).toHaveLength(1);
    expect(requests[0].method).toBe('DELETE');
    expect(requests[0].url).toContain('id=eq.fav-to-delete');
  });

  it('aborts deletion and throws when remote server fails during authenticated delete', async () => {
    localStorage.setItem(
      'fake-loc-supabase-session-v1',
      JSON.stringify({
        access_token: 'valid-jwt',
        refresh_token: 'refresh',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        user: { id: 'user-1' },
      })
    );

    const fetcher: typeof fetch = async () => {
      return Response.json({ message: 'Internal Server Error' }, { status: 500 });
    };

    const cloud = new SupabaseCloud(fetcher, { url: 'https://sample.supabase.co', publishableKey: 'sb_pub_test' });
    await expect(cloud.deleteFavorite('fav-fail')).rejects.toThrow('Internal Server Error');
  });

  it('queues offline deletion when unauthenticated and executes it upon sync after sign-in', async () => {
    const cloud = new SupabaseCloud(vi.fn(), { url: 'https://sample.supabase.co', publishableKey: 'sb_pub_test' });
    await cloud.deleteFavorite('offline-fav-1');

    const deletedJson = localStorage.getItem('fake-loc-cloud-deleted-favorites-v1');
    expect(deletedJson).toContain('offline-fav-1');

    const requests: Array<{ url: string; method?: string }> = [];
    const fetcher: typeof fetch = async (input, init = {}) => {
      const url = String(input);
      requests.push({ url, method: init.method });
      if (url.includes('/auth/v1/token?grant_type=password')) {
        return Response.json({
          access_token: 'jwt-2',
          refresh_token: 'ref-2',
          expires_in: 3600,
          user: { id: 'user-2' },
        });
      }
      if (url.includes('/rest/v1/favorites?id=in.')) {
        return new Response(null, { status: 204 });
      }
      if (url.includes('/rest/v1/favorites?select=')) {
        return Response.json([]);
      }
      throw new Error(`Unexpected: ${url}`);
    };

    const authedCloud = new SupabaseCloud(fetcher, { url: 'https://sample.supabase.co', publishableKey: 'sb_pub_test' });
    await authedCloud.signIn('user2@example.com', 'pwd');
    await authedCloud.syncFavorites([]);

    const deleteBatch = requests.find((r) => r.url.includes('/rest/v1/favorites?id=in.'));
    expect(deleteBatch).toBeDefined();
    expect(deleteBatch!.url).toContain('offline-fav-1');
    expect(localStorage.getItem('fake-loc-cloud-deleted-favorites-v1')).toBe('[]');
  });

  it('refreshes an expired session and reports provider failures', async () => {
    localStorage.setItem(
      'fake-loc-supabase-session-v1',
      JSON.stringify({ access_token: 'expired', refresh_token: 'refresh', expires_at: 1, user: { id: 'user-1' } })
    );
    const refreshCalls: string[] = [];
    const fetcher: typeof fetch = async (input) => {
      const url = String(input);
      refreshCalls.push(url);
      if (url.includes('grant_type=refresh_token')) {
        return Response.json({ access_token: 'new-token', refresh_token: 'new-refresh', expires_in: 3600, user: { id: 'user-1' } });
      }
      return Response.json([]);
    };

    const cloud = new SupabaseCloud(fetcher, { url: 'https://sample.supabase.co', publishableKey: 'sb_pub_test' });
    await expect(cloud.syncFavorites([])).resolves.toEqual([]);
    expect(refreshCalls[0]).toContain('grant_type=refresh_token');
    expect(localStorage.getItem('fake-loc-supabase-session-v1')).toContain('new-token');

    const failing = new SupabaseCloud(async () => Response.json({ msg: 'E-mail ou senha inválidos.' }, { status: 400 }), {
      url: 'https://sample.supabase.co',
      publishableKey: 'sb_pub_test',
    });
    await expect(failing.signIn('test@example.com', 'bad')).rejects.toThrow('E-mail ou senha inválidos.');
  });
});
