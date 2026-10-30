# Relatório de validação

Data do ambiente: 2026-10-30. Diretório do checkout: `/home/felipe/meu-projeto`.

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

O APK não foi gerado. Não foi possível compilar ou executar testes Android porque a distribuição Gradle não está em cache e a rede bloqueia seu download. O Android SDK não foi localizado: `ANDROID_HOME`/`ANDROID_SDK_ROOT` não definidos e não foram encontrados `sdkmanager`, `adb` ou plataforma `android.jar` nos caminhos examinados. Java disponível: OpenJDK 21.0.12.1.

Sem testes instrumentados, Playwright/E2E, cobertura ou validação em aparelho. Os 10 testes web cobrem coordenadas pt-BR, limites, distância, rumo, antimeridiano, GPX/JSON, DTD, teleporte e tela de pausa.
