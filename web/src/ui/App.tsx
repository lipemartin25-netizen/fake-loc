import { useEffect, useRef, useState } from 'react';
import { distanceMeters, parseCoordinate, type Coordinate, interpolate, initialBearing } from '../geo';
import { exportFavoritesJson, exportGpx, importFavoritesJson, importGpx, type FavoriteRecord, type GpxData } from '../fileFormats';
import { cloudConfigured, supabaseCloud, type CloudSession } from '../cloud';
import { RealMap } from './RealMap';
import { Joystick } from './Joystick';

const START: Coordinate = { latitude: -23.5505, longitude: -46.6333 };

function readFavorites(): FavoriteRecord[] {
  try {
    const v: unknown = JSON.parse(localStorage.getItem('fake-loc-favorites-v1') || '[]');
    if (!Array.isArray(v)) return [];
    return v
      .filter((x): x is FavoriteRecord => !!x && typeof x.id === 'string' && typeof x.name === 'string' && Number.isFinite(x.point?.latitude) && Number.isFinite(x.point?.longitude))
      .slice(0, 10000);
  } catch {
    return [];
  }
}

function download(name: string, mime: string, contents: string) {
  const url = URL.createObjectURL(new Blob([contents], { type: mime }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function App() {
  const [point, setPoint] = useState<Coordinate>(START);
  const [destination, setDestination] = useState<Coordinate | null>(null);
  const [lat, setLat] = useState('-23,5505');
  const [lon, setLon] = useState('-46,6333');
  const [speed, setSpeed] = useState(5);
  const [state, setState] = useState<'idle' | 'running' | 'paused' | 'completed'>('idle');
  const [progress, setProgress] = useState(0);
  const [favorites, setFavorites] = useState<FavoriteRecord[]>(readFavorites);
  const [error, setError] = useState('');
  const [fileMessage, setFileMessage] = useState('');
  const [gpxData, setGpxData] = useState<GpxData | null>(null);
  const [cloudSession, setCloudSession] = useState<CloudSession | null>(() => supabaseCloud.getSession());
  const [cloudEmail, setCloudEmail] = useState('');
  const [cloudPassword, setCloudPassword] = useState('');
  const [cloudMessage, setCloudMessage] = useState('');
  const [cloudBusy, setCloudBusy] = useState(false);
  const [mapMode, setMapMode] = useState<'real' | 'schematic'>('real');

  const jsonInput = useRef<HTMLInputElement>(null);
  const gpxInput = useRef<HTMLInputElement>(null);

  // Sync favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('fake-loc-favorites-v1', JSON.stringify(favorites));
    } catch {
      setError('O armazenamento local do navegador está indisponível ou sem espaço. Exporte os favoritos para criar um backup.');
    }
  }, [favorites]);

  // Simulation tick for linear route interpolation
  useEffect(() => {
    if (state !== 'running' || !destination) return;
    const id = window.setInterval(() => {
      setProgress((p) => {
        const step = speed / Math.max(distanceMeters(point, destination), 1);
        const next = Math.min(1, p + step);
        if (next >= 1) setState('completed');
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [state, destination, speed, point]);

  const live = destination && state !== 'idle' ? interpolate(point, destination, progress) : point;

  const setTarget = (p: Coordinate) => {
    setDestination(p);
    setLat(String(p.latitude).replace('.', ','));
    setLon(String(p.longitude).replace('.', ','));
    setProgress(0);
    setState('idle');
    setError('');
  };

  const submit = () => {
    try {
      const p = parseCoordinate(lat, lon);
      setTarget(p);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Coordenada inválida.');
    }
  };

  const save = () => {
    const name = window.prompt('Nome do favorito');
    if (name?.trim()) {
      setFavorites((v) => [
        ...v,
        {
          id: crypto.randomUUID(),
          name: name.trim(),
          point: destination || live,
          tags: [],
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  };

  const importJson = async (file: File | null) => {
    if (!file) return;
    if (file.size > 5_000_000) {
      setFileMessage('Arquivo JSON excede o limite de 5 MB.');
      return;
    }
    try {
      const result = importFavoritesJson(await file.text());
      let duplicates = 0;
      const seen = new Set(favorites.map((f) => `${f.name.trim().toLocaleLowerCase('pt-BR')}|${f.point.latitude}|${f.point.longitude}`));
      const next = [...favorites];
      for (const f of result.favorites) {
        const k = `${f.name.trim().toLocaleLowerCase('pt-BR')}|${f.point.latitude}|${f.point.longitude}`;
        if (seen.has(k)) {
          duplicates++;
          continue;
        }
        seen.add(k);
        next.push({ ...f, id: next.some((x) => x.id === f.id) ? crypto.randomUUID() : f.id });
      }
      setFavorites(next);
      setFileMessage(`Importação JSON: ${result.favorites.length - duplicates} adicionados; ${duplicates} duplicatas ignoradas; ${result.rejected} registros inválidos.`);
    } catch (e) {
      setFileMessage(e instanceof Error ? e.message : 'Falha na importação JSON.');
    }
  };

  const importGpxFile = async (file: File | null) => {
    if (!file) return;
    if (file.size > 5_000_000) {
      setFileMessage('Arquivo GPX excede o limite de 5 MB.');
      return;
    }
    try {
      const data = importGpx(await file.text());
      setGpxData(data);
      setFileMessage(`GPX carregado: ${data.waypoints.length} pontos, ${data.routes.length} rotas e ${data.trackSegments.length} segmentos.`);
    } catch (e) {
      setFileMessage(e instanceof Error ? e.message : 'Falha na importação GPX.');
    }
  };

  const exportCurrentGpx = () =>
    download(
      'fake-loc-simulacao.gpx',
      'application/gpx+xml',
      exportGpx(gpxData || { waypoints: [], routes: destination ? [[point, destination]] : [], trackSegments: destination ? [[point, destination]] : [[point]] })
    );

  const accountAction = async (kind: 'login' | 'signup') => {
    if (!cloudEmail.trim() || !cloudPassword) {
      setCloudMessage('Informe e-mail e senha.');
      return;
    }
    setCloudBusy(true);
    setCloudMessage('');
    try {
      if (kind === 'signup') {
        const session = await supabaseCloud.signUp(cloudEmail.trim(), cloudPassword);
        setCloudSession(session);
        setCloudMessage(session ? 'Conta criada e conectada.' : 'Conta criada. Confirme o e-mail para depois entrar.');
      } else {
        const session = await supabaseCloud.signIn(cloudEmail.trim(), cloudPassword);
        setCloudSession(session);
        setCloudPassword('');
        setCloudMessage(`Conectado como ${session.user.email || cloudEmail.trim()}.`);
      }
    } catch (e) {
      setCloudMessage(e instanceof Error ? e.message : 'Não foi possível acessar a conta.');
    } finally {
      setCloudBusy(false);
    }
  };

  const syncCloud = async () => {
    setCloudBusy(true);
    setCloudMessage('Sincronizando favoritos…');
    try {
      const merged = await supabaseCloud.syncFavorites(favorites);
      setFavorites(merged);
      setCloudMessage(`${merged.length} favorito(s) disponíveis neste dispositivo e na nuvem.`);
    } catch (e) {
      setCloudMessage(e instanceof Error ? e.message : 'Falha ao sincronizar favoritos.');
    } finally {
      setCloudBusy(false);
    }
  };

  return (
    <main>
      <header>
        <div>
          <span className="eyebrow">SIMULADOR MULTIPLATAFORMA</span>
          <h1>Fake Loc</h1>
        </div>
        <span className="pill">● Simulação interna</span>
      </header>

      <section className="layout">
        <div className="map-column">
          <div className="map-mode-toggle">
            <button
              className={mapMode === 'real' ? 'primary' : ''}
              onClick={() => setMapMode('real')}
            >
              🗺️ Mapa Geográfico (Tiles)
            </button>
            <button
              className={mapMode === 'schematic' ? 'primary' : ''}
              onClick={() => setMapMode('schematic')}
            >
              📐 Mapa Esquemático
            </button>
          </div>

          {mapMode === 'real' ? (
            <RealMap
              current={live}
              destination={destination}
              onSelectDestination={setTarget}
              gpxData={gpxData}
            />
          ) : (
            <div
              className="map"
              role="application"
              aria-label="Mapa esquemático. Clique para escolher um destino"
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                setTarget({
                  latitude: 90 - ((e.clientY - r.top) / r.height) * 180,
                  longitude: ((e.clientX - r.left) / r.width) * 360 - 180,
                });
              }}
            >
              <div className="grid" />
              <div className="land land-a" />
              <div className="land land-b" />
              <div className="maplabel">MAPA ESQUEMÁTICO · sem tiles</div>
              {destination && (
                <svg className="route" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <line x1="50" y1="50" x2="72" y2="35" />
                </svg>
              )}
              <div className="pin current" title="Posição simulada" />
              <div
                className="pin dest"
                style={{
                  left: destination ? `${50 + (destination.longitude - live.longitude) * 0.3}%` : '72%',
                  top: destination ? `${50 - (destination.latitude - live.latitude) * 0.4}%` : '35%',
                }}
                title="Destino"
              />
              <small className="attribution">Mapa esquemático local</small>
            </div>
          )}

          {/* Coordinate badge required by tests and telemetry overlay */}
          <div className="coordbadge">
            {live.latitude.toFixed(5)}, {live.longitude.toFixed(5)}
          </div>

          {/* Joystick Control */}
          <div className="joystick-section">
            <Joystick
              current={live}
              onMove={(next) => {
                setPoint(next);
                if (state !== 'running') {
                  setProgress(0);
                }
              }}
              speedMps={speed}
            />
          </div>
        </div>

        <aside>
          <h2>Destino</h2>
          <p className="muted">Insira coordenadas em graus decimais. Vírgula decimal aceita.</p>
          <label>
            Latitude
            <input inputMode="decimal" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="-23,5505" />
          </label>
          <label>
            Longitude
            <input inputMode="decimal" value={lon} onChange={(e) => setLon(e.target.value)} placeholder="-46,6333" />
          </label>
          <button className="primary" onClick={submit}>
            Definir destino
          </button>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <button
            disabled={!destination}
            onClick={() => {
              if (destination) {
                setPoint(destination);
                setProgress(0);
                setState('idle');
              }
            }}
          >
            Teleportar posição interna para destino
          </button>
          <button onClick={() => navigator.clipboard?.writeText(`${live.latitude.toFixed(6)}, ${live.longitude.toFixed(6)}`)}>
            Copiar posição atual
          </button>
          <hr />

          <h2>Simulação interna</h2>
          <div className="stats">
            <div>
              <small>Estado</small>
              <b>{state === 'running' ? 'Em movimento' : state === 'paused' ? 'Pausada' : state === 'completed' ? 'Concluída' : 'Parada'}</b>
            </div>
            <div>
              <small>Distância restante</small>
              <b>{destination ? Math.round(distanceMeters(live, destination)) + ' m' : '—'}</b>
            </div>
            <div>
              <small>Rumo inicial</small>
              <b>{destination ? Math.round(initialBearing(live, destination)) + '°' : '—'}</b>
            </div>
          </div>
          <label>
            Velocidade <b>{speed} m/s</b> ({Math.round(speed * 3.6)} km/h)
            <input aria-label="Velocidade em metros por segundo" type="range" min="1" max="50" value={speed} onChange={(e) => setSpeed(+e.target.value)} />
          </label>
          <div className="buttons">
            <button
              className="primary"
              disabled={!destination || state === 'running'}
              onClick={() => {
                if (state === 'completed') setProgress(0);
                setState('running');
              }}
            >
              {state === 'paused' ? 'Retomar' : 'Iniciar'}
            </button>
            <button disabled={state !== 'running'} onClick={() => setState('paused')}>
              Pausar
            </button>
            <button
              onClick={() => {
                setProgress(0);
                setState('idle');
              }}
            >
              Parar
            </button>
          </div>

          <button onClick={save}>☆ Salvar destino como favorito</button>
          <h2>
            Favoritos <span className="count">{favorites.length}</span>
          </h2>
          {favorites.length ? (
            favorites.map((f) => (
              <div className="favorite" key={f.id}>
                <button onClick={() => setTarget(f.point)}>
                  {f.name}
                  <small>
                    {f.point.latitude.toFixed(4)}, {f.point.longitude.toFixed(4)}
                  </small>
                </button>
                <button
                  aria-label={`Excluir ${f.name}`}
                  onClick={() => {
                    supabaseCloud.markFavoriteDeleted(f.id);
                    setFavorites((v) => v.filter((x) => x.id !== f.id));
                  }}
                >
                  ×
                </button>
              </div>
            ))
          ) : (
            <p className="muted">Destinos salvos aparecerão aqui.</p>
          )}

          <hr />
          <h2>Conta e sincronização</h2>
          {!cloudConfigured ? (
            <p className="muted">Nuvem não configurada nesta build. O modo local funciona sem conta.</p>
          ) : cloudSession ? (
            <>
              <p className="muted">Conectado como {cloudSession.user.email || 'usuário Fake Loc'}.</p>
              <button className="primary" disabled={cloudBusy} onClick={() => void syncCloud()}>
                {cloudBusy ? 'Aguarde…' : 'Sincronizar favoritos'}
              </button>
              <button
                onClick={() => {
                  void supabaseCloud
                    .signOut()
                    .then(() => {
                      setCloudSession(null);
                      setCloudMessage('Sessão encerrada. Favoritos locais preservados.');
                    })
                    .catch((e) => setCloudMessage(e instanceof Error ? e.message : 'Falha ao sair.'));
                }}
              >
                Sair da conta
              </button>
            </>
          ) : (
            <>
              <p className="muted">Entre ou crie uma conta para sincronizar favoritos entre dispositivos. Dados locais permanecem neste navegador.</p>
              <label>
                E-mail
                <input type="email" autoComplete="email" value={cloudEmail} onChange={(e) => setCloudEmail(e.target.value)} />
              </label>
              <label>
                Senha
                <input type="password" autoComplete="current-password" value={cloudPassword} onChange={(e) => setCloudPassword(e.target.value)} />
              </label>
              <div className="buttons">
                <button className="primary" disabled={cloudBusy} onClick={() => void accountAction('login')}>
                  Entrar
                </button>
                <button disabled={cloudBusy} onClick={() => void accountAction('signup')}>
                  Criar conta
                </button>
              </div>
            </>
          )}
          {cloudMessage && (
            <p role="status" className="muted">
              {cloudMessage}
            </p>
          )}

          <h2>Arquivos e backup</h2>
          <input
            ref={jsonInput}
            hidden
            type="file"
            accept="application/json,.json"
            onChange={(e) => {
              void importJson(e.currentTarget.files?.[0] || null);
              e.currentTarget.value = '';
            }}
          />
          <input
            ref={gpxInput}
            hidden
            type="file"
            accept="application/gpx+xml,.gpx,.xml"
            onChange={(e) => {
              void importGpxFile(e.currentTarget.files?.[0] || null);
              e.currentTarget.value = '';
            }}
          />
          <div className="file-actions">
            <button onClick={() => jsonInput.current?.click()}>Importar favoritos JSON</button>
            <button onClick={() => download('fake-loc-favoritos.json', 'application/json', exportFavoritesJson(favorites))}>Exportar JSON</button>
            <button onClick={() => gpxInput.current?.click()}>Importar GPX 1.1</button>
            <button onClick={exportCurrentGpx}>Exportar GPX</button>
          </div>
          {fileMessage && (
            <p role="status" className="muted">
              {fileMessage}
            </p>
          )}
          <p className="notice">A simulação altera apenas este painel. Não modifica o GPS do aparelho nem controla outros aplicativos.</p>
        </aside>
      </section>
    </main>
  );
}
