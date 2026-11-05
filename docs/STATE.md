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
| Motor geográfico web | Implementado com testes identificados | Geografia, validação e antimeridiano; 3 testes unitários |
| Web vertical | Implementado com testes identificados | Coordenadas, telemetria, favoritos, GPX, JSON e cliente Supabase isolado; veja relatório de 12 testes |
| Mapa | Parcial | Canvas esquemático interativo, sem tiles |
| Busca externa, GPX/JSON, rotas | Parcial | GPX e JSON de favoritos implementados na web; busca e editor/playback de rotas não implementados |
| Android | Parcial | Compose, movimento interno básico e motor geográfico; Geo compilado isoladamente; build bloqueado por SDK e localização mock ainda não ligada |
| Supabase | Parcial | Schema Fake Loc aplicado com RLS; cliente web inclui Auth e sincronização opt-in de favoritos. Teste de isolamento com múltiplas contas reais pendente. |
| Desktop | Base implementada | Camada Electron com sandbox, contextIsolation, preload seguro e suporte a empacotamento Windows, Linux e macOS |
| GitHub | Publicado | Branch remota `codex/fake-loc-rebuild` e PR #1 criados |
| Vercel | Preparação local | Documentação atualizada para projeto `all-smal-things`; deploy e domínio público pendentes |
| CI e APK | Em andamento | Workflows adicionados para Web (aprovado), Android (ajuste de sdkmanager no runner) e Desktop (Linux, Windows, macOS) |

A localização simulada não foi validada em aparelho real. O projeto continua sendo uma ferramenta para testes e desenvolvimento autorizados sem injeção sistêmica no modo web/desktop.
