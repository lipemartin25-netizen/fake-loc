# Fake Loc

Ferramenta de simulação de localização e telemetria para desenvolvimento, demonstração e testes autorizados de software georreferenciado.

A aplicação opera de forma puramente interna por padrão. **Não altera o GPS global do dispositivo móvel nem do sistema operacional desktop, não contorna proteções de segurança e não realiza injeção em aplicativos de terceiros.**

---

## 1. Visão Geral das Plataformas

| Plataforma | Interface / Tecnologia | Comportamento e Limites |
| :--- | :--- | :--- |
| **Web** | React + TypeScript + Vite + Leaflet | Simulação interna com mapa geográfico (OpenStreetMap) ou esquemático; controle por joystick virtual e teclado; importação/exportação GPX/JSON; sincronização de favoritos via Supabase (opcional). |
| **Desktop** | Electron (Linux, Windows, macOS) | Empacotamento desktop seguro (`nodeIntegration: false`, `contextIsolation: true`, `sandbox: true`). Opera com a mesma simulação interna e arquivos locais. Não altera o provedor de localização do SO. |
| **Android** | Kotlin + Jetpack Compose | Aplicativo demonstrativo de simulação interna de coordenadas em tela. Mock Location Provider sistêmico e serviço de primeiro plano não estão ativos nesta versão. |
| **Nuvem (Opcional)** | Supabase (PostgreSQL + RLS) | Sincronização sob demanda de favoritos entre dispositivos para usuários cadastrados. Telemetria e histórico não são transmitidos. |

---

## 2. Requisitos de Ambiente

- **Node.js**: Versão `22.x` (LTS recomendada, ex.: `22.23.4`).
- **npm**: Versão `10.x` ou superior.
- **Java / JDK** (para builds Android): OpenJDK 17 ou 21.
- **Android SDK** (para compilação local Android): API 35 (`platforms;android-35` e `build-tools;35.0.0`).

---

## 3. Instruções de Execução e Desenvolvimento

### Aplicação Web

1. Acesse a pasta `web/` e instale as dependências:
   ```bash
   cd web
   npm ci
   ```
2. Para iniciar o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   Acesse a URL exibida no terminal (por padrão `http://localhost:5173`).

3. Para executar a suíte completa de verificações e testes:
   ```bash
   npm run lint        # Verificação de estilo com ESLint
   npm run typecheck   # Checagem estática de tipos com TypeScript
   npm test            # Execução de testes unitários com Vitest
   npm run build       # Build de produção otimizado em web/dist/
   ```

### Aplicação Desktop (Electron)

1. Acesse a pasta `desktop/` e instale as dependências:
   ```bash
   cd desktop
   npm ci
   ```
2. Para empacotar os binários locais:
   ```bash
   npm run pack        # Gera versão descompactada de teste em desktop/dist/
   ```
3. Para gerar instaladores distribuíveis (conforme a plataforma):
   - Linux: `npm run dist:linux` (gera .AppImage e .deb)
   - Windows: `npm run dist:win` (gera instalador NSIS .exe)
   - macOS: `npm run dist:mac` (gera imagem .dmg)

### Aplicativo Android

1. Acesse a pasta `android/`:
   ```bash
   cd android
   ```
2. Para compilar o APK de depuração e rodar os testes unitários:
   ```bash
   ./gradlew :app:assembleDebug :app:testDebugUnitTest
   ```
   O APK gerado ficará em `android/app/build/outputs/apk/debug/app-debug.apk`.

---

## 4. Nuvem e Sincronização Opcional (Supabase)

O Fake Loc funciona perfeitamente sem nenhuma conexão com a nuvem. Caso deseje habilitar a sincronização opcional de favoritos:
1. Copie o arquivo de exemplo:
   ```bash
   cp web/.env.example web/.env.local
   ```
2. Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` com os dados do seu projeto Supabase.
3. Consulte o [Guia de Configuração do Supabase](docs/SUPABASE_SETUP.md) para detalhes de segurança e aplicação de esquemas não destrutivos.

---

## 5. Documentação Complementar

- [Arquitetura do Projeto](docs/ARCHITECTURE.md)
- [Matriz de Aceite e Funcionalidades](docs/ACCEPTANCE.md)
- [Segurança e Privacidade](docs/PRIVACY.md)
- [Configuração do Banco Supabase](docs/SUPABASE_SETUP.md)
- [Guia de Deploy na Vercel](docs/DEPLOY.md)
- [Dependências de Terceiros e Licenças](docs/THIRD-PARTY.md)
- [Relatório de Validação e Testes](docs/TEST-REPORT.md)
