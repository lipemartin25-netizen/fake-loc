# Estado da reconstrução (Atualizado em 2026-11-05)

## Inspeção

- Código consolidado em `/home/felipe/Documentos/gps fak`; branch `codex/fake-loc-rebuild`.
- Pasta de destino e histórico foram preservados conforme baseline.
- `scripts/doctor.sh` aprovou DNS/HTTPS (GitHub, npm, Vercel, Supabase), bind local (porta 5173), autenticação GitHub CLI (`gh`), Node 22 e JDK 21. Android SDK não configurado no ambiente.
- Node v22.23.4/npm 10.9.9: ESLint, typecheck, 12 testes e build Vite aprovados; detalhes em [TEST-REPORT.md](TEST-REPORT.md).
- Gradle Wrapper 8.9 operacional; compilação e teste Android `:app:testDebugUnitTest` pendentes de configuração do Android SDK.
- `scripts/publish-github.sh` corrigido para utilizar timeout direto no executável `git` dentro de `gh_git`, com consulta remota validada e branch de trabalho pronta para publicação.

## Implementação

| Área | Estado | Evidência/limite |
|---|---|---|
| Motor geográfico | Implementado com testes | Haversine, WGS84, antimeridiano, interpolação e projectCoordinate; 4 testes unitários TS e 3 testes Kotlin |
| Web vertical | Implementado com testes | Coordenadas, telemetria, favoritos, GPX, JSON e cliente Supabase isolado; 13 testes unitários aprovados |
| Mapa | Implementado | Mapa interativo com OpenStreetMap tiles (Leaflet), marcadores customizados, destino arrastável e polylines; fallback esquemático preservado |
| Joystick | Implementado | Controle analógico por ponteiro/toque e teclado (W/A/S/D e setas) com teto monotônico de 200ms por frame |
| Busca externa, GPX/JSON, rotas | Parcial | GPX e JSON de favoritos implementados na web; rotas multiponto e busca por texto pendentes |
| Android | Compilado e testado em CI | Compose, Geo.kt e build `:app:assembleDebug` aprovados; APK debug gerado como artefato em CI |
| Supabase | Parcial | Schema Fake Loc aplicado com RLS; cliente web inclui Auth e sincronização opt-in de favoritos. Teste de isolamento com múltiplas contas reais pendente. |
| Desktop | Compilado em CI | Electron empacotado e gerado em CI para Windows (.exe), Linux (AppImage + .deb) e macOS (.dmg) |
| GitHub | Publicado | Branch remota `codex/fake-loc-rebuild` e PR #1 criados |
| Vercel | Preparação local | Documentação atualizada para projeto `all-smal-things`; deploy e domínio público pendentes |
| CI e Artefatos | Aprovados | Workflows Web, Android e Desktop gerando artefatos oficiais no GitHub Actions |

A localização simulada não foi validada em aparelho real. O projeto continua sendo uma ferramenta para testes e desenvolvimento autorizados sem injeção sistêmica no modo web/desktop.
