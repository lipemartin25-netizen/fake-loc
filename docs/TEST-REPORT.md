# Relatório de validação

Data do ambiente: 2026-10-30. Diretório canônico: `/home/felipe/Documentos/gps fak`.

| Diretório | Comando | Resultado | Exit code |
|---|---|---|---|
| `web/` | `npm ci --offline --ignore-scripts` | 236 pacotes instalados do cache com lockfile; 0 vulnerabilidades reportadas | 0 |
| `web/` | `npm run typecheck` | TypeScript passou | 0 |
| `web/` | `npm test -- --reporter=verbose` | 3 arquivos; 10 testes aprovados; 0 falhas/ignorados | 0 |
| `web/` | `npm run build` | Vite gerou `web/dist/` | 0 |
| `web/` | `npm run lint` | ESLint passou sem avisos | 0 |
| `android/` | `./gradlew :app:assembleDebug :app:testDebugUnitTest :app:lintDebug` | Wrapper iniciou, mas download do Gradle bloqueado pelo ambiente: `SocketException: Operation not permitted` | 1 |
| raiz | Compilação isolada de `android/app/src/main/java/br/com/fakeloc/app/Geo.kt` com Kotlin 2.4.0 e checks via Kotlin runner | Motor Kotlin compilou; distância SP–Rio, rumo cardinal e antimeridiano passaram | 0 |
| raiz | `git diff --check` | Sem erros de whitespace | 0 |
| `web/` | `npm run dev -- --host 0.0.0.0` | Não iniciou: sandbox negou bind com `listen EPERM` | 1 |
| `web/` | `npm run dev -- --host 127.0.0.1 --port 5173 --strictPort` | Não iniciou no loopback: sandbox negou bind com `listen EPERM` | 1 |
| raiz | `gh auth status` | Conta configurada, credencial inválida; não autenticado para publicação | 1 |
| raiz | `git ls-remote git@github.com:lipemartin25-netizen/fake-loc.git HEAD refs/heads/main refs/heads/master` | DNS não resolveu `github.com`; remoto não pôde ser consultado | 128 |

O APK não foi gerado. Não foi possível compilar ou executar testes Android porque a distribuição Gradle não está em cache e a rede bloqueia seu download. O Android SDK não foi localizado: `ANDROID_HOME`/`ANDROID_SDK_ROOT` não definidos e não foram encontrados `sdkmanager`, `adb` ou plataforma `android.jar` nos caminhos examinados. Java disponível: OpenJDK 21.0.12.1. Android Studio está instalado via Flatpak, mas não há SDK identificado pela sessão do agente.

Sem testes instrumentados, Playwright/E2E, cobertura ou validação em aparelho. Build web passou; servidor HTTP local e URL pública não foram confirmados porque a sessão não permite abrir sockets e não tem autenticação/remoto acessível. Os 10 testes web cobrem coordenadas pt-BR, limites, distância, rumo, antimeridiano, GPX/JSON, DTD, teleporte e tela de pausa.
