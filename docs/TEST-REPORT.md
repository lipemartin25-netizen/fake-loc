# Relatório Consolidado de Testes e Validação — Fake Loc

Data da última execução: 17/11/2026.
Ambiente de validação: Linux x86_64, Node v22.23.4 (npm v10.9.9), OpenJDK 21.

---

## 1. Execuções Locais no Repositório

| Componente | Comando Executado | Resultado Obtido | Código de Saída |
| :--- | :--- | :--- | :--- |
| `web/` | `npm run lint` | ESLint executado sem nenhum erro ou aviso | 0 |
| `web/` | `npm run typecheck` | TypeScript (`tsc --noEmit`) executado sem nenhum erro de tipagem | 0 |
| `web/` | `npm test` | Vitest: 4 arquivos de teste, **17 testes aprovados**, 0 falhas, 0 ignorados | 0 |
| `web/` | `npm run build` | Vite gerou os artefatos de produção em `web/dist/` (HTML, CSS e JS minificados com sourcemaps e gzip otimizados) | 0 |
| `supabase/` | Validação de sintaxe DDL | `schema.sql` substituído por DDL idempotente sem comandos `DROP TABLE ... CASCADE` | Aprovado |

### Detalhamento dos Testes Unitários Web (17 testes)
1. **`src/geo.test.ts` (4 testes)**:
   - Cálculo de distância Haversine (São Paulo a Rio de Janeiro).
   - Cálculo de rumo inicial (*initial bearing*) para pontos cardeais.
   - Interpolação ao longo de arcos geodésicos e tratamento de antimeridiano (meridiano 180°).
   - Projeção de coordenadas para o Joystick (`projectCoordinate`).
2. **`src/fileFormats.test.ts` (3 testes)**:
   - Exportação e importação de favoritos em JSON com validação de schema e duplicatas.
   - Parsing de GPX 1.1 com waypoints e rotas.
   - Rejeição de entidades externas e DTD em GPX para mitigar vulnerabilidades XXE.
3. **`src/cloud.test.ts` (6 testes)**:
   - Login, upload de favoritos e mesclagem (*merge*) respeitando políticas RLS do Supabase.
   - Rejeição de tentativa de sincronização não autenticada.
   - Exclusão direta na nuvem quando autenticado, sem perda de dados.
   - Aborto e relatório de erro quando o servidor remoto falha durante a exclusão.
   - Fila de exclusão offline para usuários não autenticados, processada no próximo login/sync.
   - Renovação automática de sessão expirada via `refresh_token` e tratamento de erros do provedor.
4. **`src/ui/App.test.tsx` (4 testes)**:
   - Renderização inicial da interface e exibição de coordenadas formatadas.
   - Aceitação de coordenadas manuais com vírgula ou ponto decimal.
   - Ação de teleporte atualizando a posição simulada.
   - Pausa e retomada da simulação mantendo a posição exata.

---

## 2. Validação de Integração Contínua (CI - GitHub Actions)

| Workflow | Gatilho / Run | Etapas e Verificações | Artefatos Gerados |
| :--- | :--- | :--- | :--- |
| **`Web checks`** | Push / Pull Request | Node 22, `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` | Artefatos web compilados |
| **`Android checks`** | Push / Pull Request | OpenJDK 21, Android SDK 35, `./gradlew :app:assembleDebug :app:testDebugUnitTest :app:lintDebug` | `fake-loc-debug-apk` |
| **`Desktop builds`** | Push / Pull Request | Electron Builder matrix (Ubuntu, Windows, macOS runners) | Instalador Linux (.AppImage, .deb), Windows (.exe NSIS) e macOS (.dmg) |

---

## 3. Limitações e Escopo de Validação

- Os testes unitários do cliente Supabase utilizam simulação (*mocking*) de respostas HTTP para garantir determinismo e independência de rede externa.
- A compilação Android em CI valida a integridade sintática e de tipos do código Kotlin e a geração do APK debug, mas não substitui o teste em dispositivos físicos reais.
- A aplicação não foi assinada com chaves de produção (keystore de release para Android ou certificados de assinatura de código para Windows e macOS), o que deve ser realizado em etapa posterior com autorização do proprietário.
