import type { FavoriteRecord } from './fileFormats';

export type CloudSession = {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  expires_in?: number;
  user: { id: string; email?: string };
};

type CloudFavorite = {
  id: string;
  user_id: string;
  name: string;
  latitude: number;
  longitude: number;
  tags: string[];
  created_at: string;
  updated_at: string;
};

const SESSION_KEY = 'fake-loc-supabase-session-v1';
const DELETED_KEY = 'fake-loc-cloud-deleted-favorites-v1';
const apiUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '');
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const cloudConfigured = Boolean(apiUrl && publishableKey);

function storedSession(): CloudSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (value && typeof value === 'object' && 'access_token' in value && 'refresh_token' in value && 'user' in value) return value as CloudSession;
  } catch { /* Invalid local session is discarded below. */ }
  localStorage.removeItem(SESSION_KEY);
  return null;
}

function saveSession(session: CloudSession | null): void {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
}

function getDeleted(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(DELETED_KEY) || '[]');
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : [];
  } catch { return []; }
}

function setDeleted(ids: string[]): void {
  localStorage.setItem(DELETED_KEY, JSON.stringify([...new Set(ids)].slice(-10000)));
}

export class SupabaseCloud {
  private session: CloudSession | null = null;
  private readonly url?: string;
  private readonly key?: string;

  constructor(private readonly fetcher: typeof fetch = fetch, config: { url?: string; publishableKey?: string } = { url: apiUrl, publishableKey }) {
    this.url = config.url?.replace(/\/$/, '');
    this.key = config.publishableKey;
    this.session = storedSession();
  }

  getSession(): CloudSession | null { return this.session; }

  private async request<T>(path: string, init: RequestInit = {}, authenticated = false): Promise<T> {
    if (!this.url || !this.key) throw new Error('Sincronização Supabase não está configurada nesta versão.');
    const headers = new Headers(init.headers);
    headers.set('apikey', this.key);
    headers.set('Accept', 'application/json');
    if (init.body) headers.set('Content-Type', 'application/json');
    if (authenticated) {
      const session = await this.ensureSession();
      headers.set('Authorization', `Bearer ${session.access_token}`);
    } else headers.set('Authorization', `Bearer ${this.key}`);
    const response = await this.fetcher(`${this.url}${path}`, { ...init, headers });
    if (!response.ok) {
      let detail = '';
      try { const body = await response.json() as { msg?: string; message?: string; error_description?: string }; detail = body.msg || body.message || body.error_description || ''; } catch { /* Keep generic status. */ }
      if (response.status === 401 && authenticated) { this.session = null; saveSession(null); }
      throw new Error(detail || `Supabase respondeu HTTP ${response.status}.`);
    }
    if (response.status === 204) return undefined as T;
    return await response.json() as T;
  }

  async signUp(email: string, password: string): Promise<CloudSession | null> {
    const result = await this.request<CloudSession | { user: CloudSession['user'] }>('/auth/v1/signup', { method: 'POST', body: JSON.stringify({ email, password }) });
    if ('access_token' in result && result.access_token) { this.session = this.normalizeSession(result); saveSession(this.session); return this.session; }
    return null;
  }

  async signIn(email: string, password: string): Promise<CloudSession> {
    const session = await this.request<CloudSession>('/auth/v1/token?grant_type=password', { method: 'POST', body: JSON.stringify({ email, password }) });
    this.session = this.normalizeSession(session);
    saveSession(this.session);
    return this.session;
  }

  async signOut(): Promise<void> {
    try { if (this.session) await this.request<void>('/auth/v1/logout', { method: 'POST' }, true); }
    finally { this.session = null; saveSession(null); }
  }

  private async ensureSession(): Promise<CloudSession> {
    if (!this.session) throw new Error('Entre na sua conta Fake Loc para sincronizar.');
    if (!this.session.expires_at || this.session.expires_at * 1000 > Date.now() + 60_000) return this.session;
    const refreshed = await this.request<CloudSession>('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: JSON.stringify({ refresh_token: this.session.refresh_token }) });
    this.session = this.normalizeSession(refreshed);
    saveSession(this.session);
    return this.session;
  }

  private normalizeSession(session: CloudSession): CloudSession {
    return { ...session, expires_at: session.expires_at ?? (session.expires_in ? Math.floor(Date.now() / 1000) + session.expires_in : undefined) };
  }

  markFavoriteDeleted(id: string): void { try { setDeleted([...getDeleted(), id]); } catch { /* Cloud sync remains best-effort when browser storage is unavailable. */ } }

  async syncFavorites(local: FavoriteRecord[]): Promise<FavoriteRecord[]> {
    const session = await this.ensureSession();
    const deleted = getDeleted();
    if (deleted.length) {
      const filter = deleted.map(encodeURIComponent).join(',');
      await this.request<void>(`/rest/v1/favorites?id=in.(${filter})`, { method: 'DELETE' }, true);
    }
    const now = new Date().toISOString();
    if (local.length) {
      const rows: CloudFavorite[] = local.map(f => ({
        id: f.id, user_id: session.user.id, name: f.name, latitude: f.point.latitude,
        longitude: f.point.longitude, tags: f.tags, created_at: f.createdAt, updated_at: now,
      }));
      await this.request<CloudFavorite[]>('/rest/v1/favorites?on_conflict=id', {
        method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(rows),
      }, true);
    }
    const remote = await this.request<CloudFavorite[]>('/rest/v1/favorites?select=id,user_id,name,latitude,longitude,tags,created_at,updated_at&order=updated_at.asc', {}, true);
    setDeleted([]);
    const byId = new Map<string, FavoriteRecord>();
    for (const f of remote) byId.set(f.id, { id: f.id, name: f.name, point: { latitude: f.latitude, longitude: f.longitude }, tags: f.tags || [], createdAt: f.created_at });
    for (const f of local) byId.set(f.id, f);
    return [...byId.values()];
  }
}

export const supabaseCloud = new SupabaseCloud();
