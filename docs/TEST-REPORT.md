# Relatório de validação

Data do ambiente: 2026-10-30. Diretório canônico: `/home/felipe/Documentos/gps fak`.

| Diretório | Comando | Resultado | Exit code |
|---|---|---|---|
| `web/` | `npm ci --offline --ignore-scripts` | 236 pacotes instalados do cache com lockfile; 0 vulnerabilidades reportadas | 0 |
| `web/` | `npm run typecheck` | TypeScript passou | 0 |
| `web/` | `npm test -- --reporter=verbose` | 3 arquivos; 10 testes aprovados; 0 falhas/ignorados | 0 |
| `web/` | `npm run build` | Vite gerou `web/dist/` | 0 |
| `web/` | `npm run lint` | ESLint passou sem avisos | 0 |
| `web/` | `npm run lint` (alterações Supabase) | ESLint passou | 0 |
| `web/` | `npm run typecheck` (alterações Supabase) | TypeScript passou | 0 |
| `web/` | `npm test` (alterações Supabase) | 4 arquivos; 12 testes aprovados; 0 falhas/ignorados. Inclui dois testes HTTP do cliente Supabase mockado, sem conta/provedor real | 0 |
| `web/` | `npm run build` (alterações Supabase) | Vite gerou `web/dist/` | 0 |
| Supabase `cejivififvlhnwyeajwc` | `apply_migration: fake_loc_initial_schema` | Aplicado com sucesso; substituiu 40 tabelas do schema `public` por `favorites`, `routes` e `movement_profiles` | sucesso informado pela ferramenta |
| Supabase `cejivififvlhnwyeajwc` | `apply_migration: remove_legacy_product_hooks` | Aplicado com sucesso; removeu o gatilho legado de `auth.users` que dependia da tabela antiga `profiles` e RPCs antigos | sucesso informado pela ferramenta |
| Supabase `cejivififvlhnwyeajwc` | Consulta `information_schema.tables` e `list_tables` | Confirmadas 3 tabelas Fake Loc, todas com RLS ativo e sem linhas | sucesso informado pela ferramenta |
| Supabase `cejivififvlhnwyeajwc` | `get_advisors(security)` após as migrations | Sem aviso de rotina `SECURITY DEFINER` pública; 2 avisos restantes para extensões legadas `vector` e `pg_trgm` no schema `public` | sucesso informado pela ferramenta |
| Ambiente | `curl -L --max-time 12 -sS https://supabase.com/changelog.md` | DNS local não resolveu `supabase.com`; documentação Supabase foi consultada pela busca oficial de docs. O changelog em Markdown não pôde ser baixado por curl | 6 |
| `web/` | Node 20.20.2: `npm ci --offline` + typecheck + testes | Instalação/typecheck passaram com avisos de engine; Vitest falhou ao carregar `undici` (`Cannot read properties of undefined (reading 'bind')`), pois jsdom 30/undici 8 exigem Node 22+. Projeto ajustado para Node 22 | 1 no Vitest |
| `android/` | `./gradlew :app:assembleDebug :app:testDebugUnitTest :app:lintDebug` | Wrapper iniciou, mas download do Gradle bloqueado pelo ambiente: `SocketException: Operation not permitted` | 1 |
| raiz | Compilação isolada de `android/app/src/main/java/br/com/fakeloc/app/Geo.kt` com Kotlin 2.4.0 e checks via Kotlin runner | Motor Kotlin compilou; distância SP–Rio, rumo cardinal e antimeridiano passaram | 0 |
| raiz | `git diff --check` | Sem erros de whitespace | 0 |
| `web/` | `npm run dev -- --host 0.0.0.0` | Não iniciou: sandbox negou bind com `listen EPERM` | 1 |
| `web/` | `npm run dev -- --host 127.0.0.1 --port 5173 --strictPort` | Não iniciou no loopback: sandbox negou bind com `listen EPERM` | 1 |
| raiz | `gh auth status` | Conta configurada, credencial inválida; não autenticado para publicação | 1 |
| raiz | `git ls-remote git@github.com:lipemartin25-netizen/fake-loc.git HEAD refs/heads/main refs/heads/master` | DNS não resolveu `github.com`; remoto não pôde ser consultado | 128 |

Validação web final executada com Node v22.23.4/npm 10.9.9, conforme `engines.node`. Uma execução inicial em Node 20.20.2 mostrou incompatibilidade real nos motores de dependências transitivas de teste; o projeto agora fixa Node 22.x, que também está disponível na Vercel.

O APK não foi gerado. Não foi possível compilar ou executar testes Android porque a distribuição Gradle não está em cache e a rede bloqueia seu download. O Android SDK não foi localizado: `ANDROID_HOME`/`ANDROID_SDK_ROOT` não definidos e não foram encontrados `sdkmanager`, `adb` ou plataforma `android.jar` nos caminhos examinados. Java disponível: OpenJDK 21.0.12.1. Android Studio está instalado via Flatpak, mas não há SDK identificado pela sessão do agente.

Na validação anterior não houve testes instrumentados, Playwright/E2E, cobertura ou validação em aparelho. Build web passou; servidor HTTP local e URL pública não foram confirmados porque a sessão não permitia abrir sockets. Os 10 testes daquela execução cobriam coordenadas pt-BR, limites, distância, rumo, antimeridiano, GPX/JSON, DTD, teleporte e pausa; a execução atual está abaixo.

## Continuação — 2026-10-30

| Diretório | Comando | Resultado | Exit code |
|---|---|---|---|
| `web/` | `PATH="/home/felipe/.nvm/versions/node/v22.23.4/bin:$PATH" npm run lint` | ESLint aprovado | 0 |
| `web/` | `PATH="/home/felipe/.nvm/versions/node/v22.23.4/bin:$PATH" npm run typecheck` | Checagem TypeScript aprovada | 0 |
| `web/` | `PATH="/home/felipe/.nvm/versions/node/v22.23.4/bin:$PATH" npm test` | 4 arquivos; 12 aprovados, 0 falhas, 0 ignorados | 0 |
| `web/` | `PATH="/home/felipe/.nvm/versions/node/v22.23.4/bin:$PATH" npm run build` | Build Vite aprovado em `web/dist` | 0 |
| raiz | `bash -n scripts/doctor.sh scripts/publish-github.sh` | Sintaxe dos dois scripts aprovada | 0 |
| raiz | `scripts/doctor.sh` | Detectou DNS/HTTPS bloqueados, autenticação GitHub válida, bind local negado, Node 22 presente e SDK Android ausente | 0 (diagnóstico) |
| raiz | `scripts/publish-github.sh --dry-run` | Allowlist de 18 arquivos revisada; nenhuma alteração Git feita | 0 |
| raiz | `scripts/publish-github.sh` | Criou commit local `e34e9f29084bdda705a557367425adbd2fb345f7`; consulta DNS/remota falhou e o script não enviou push nem criou PR | 6 |
| raiz | `bash -n scripts/doctor.sh scripts/publish-github.sh` após corrigir retomada de commits já feitos | Sintaxe aprovada; dry-run com working tree limpo continua tentando consultar o remoto, sem modificar arquivos | 0 |
| raiz | `scripts/publish-github.sh --dry-run` após correção de retomada | Arquivo aprovado revisado; remoto inacessível reportado; nenhuma alteração Git feita | 0 |
| raiz | `scripts/publish-github.sh` após correção de retomada | Commit local da revisão do script criado; fetch/push segue bloqueado por DNS. PR não criado | 6 |
| raiz | `exec_command` com `sandbox_permissions=require_escalated` para GitHub e Vite | A política da sessão recusou escalonamento (`sandbox_approval: false`); comandos externos não foram executados | recusado pela ferramenta |

O `web/.env.example` está presente e não é ignorado; `web/.env.local` continua ignorado. A sessão não permitiu iniciar Vite/bind para verificar HTTP. Vercel não foi configurada nem publicada: CLI ausente e domínio público não verificado. O APK não existe; Android SDK não foi localizado.
