# Arquitetura do Fake Loc

O **Fake Loc** é estruturado como uma aplicação multiplataforma centrada em um núcleo puramente computacional de matemática geodésica e telemetria, com clientes Web, Desktop e Android.

---

## 1. Núcleo Geográfico (`web/src/geo.ts` e `android/.../Geo.kt`)

O motor matemático é estritamente puro e desvinculado de frameworks de interface:
- **Modelo de Coordenadas**: Objetos latitude e longitude segundo o datum WGS84 em graus decimais (`-90` a `+90` para latitude, `-180` a `+180` para longitude).
- **Cálculo de Distâncias**: Implementação da fórmula de Haversine sobre uma esfera média de raio $R = 6.371.008,8\text{ m}$.
- **Interpolação Geodésica**: Deslocamento linear ao longo do menor arco de grande círculo, tratando corretamente a travessia do antimeridiano (meridiano 180°).
- **Projeção Geodésica Directa (`projectCoordinate`)**: Utilizada pelo Joystick virtual para calcular a nova coordenada resultante a partir de uma distância (metros) e um azimute (graus).

---

## 2. Camada Web (`web/`)

- **Interface**: React 18 com TypeScript, compilada via Vite.
- **Visualização Cartográfica**:
  - **Modo Real**: Componente `RealMap` utilizando a biblioteca **Leaflet** com camada de tiles do **OpenStreetMap**. Marcador da posição simulada com efeito de pulso, marcador de destino arrastável (*draggable*) e linhas de rota (*polylines*).
  - **Modo Esquemático**: Fallback em CSS/SVG puro que não depende de conexões de rede ou carregamento de tiles.
- **Controle Analógico (Joystick Virtual)**:
  - Componente `Joystick` com suporte a ponteiro/toque e teclado físico (teclas W/A/S/D e setas direcionais).
  - Controle de frame monotônico com limite rígido de 200 ms por atualização, prevenindo saltos abruptos de posição após suspensão de abas ou perda de foco.
  - Supressão de captura de teclas enquanto o usuário digita em campos de texto.
- **Persistência Local**:
  - Armazenamento em `localStorage` sob a chave versionada `fake-loc-favorites-v1`.
  - Importação e exportação de favoritos em formato JSON validado (schema v1) e arquivos GPX 1.1 com proteção contra ataques XML (DTD/XXE desativados).

---

## 3. Integração com a Nuvem (Supabase)

- **Arquitetura Opt-in**: A nuvem só é utilizada se o usuário voluntariamente fizer login. Caso contrário, a aplicação funciona 100% offline.
- **Row Level Security (RLS)**: O isolamento dos dados ocorre no nível do banco de dados PostgreSQL. As políticas garantem que cada usuário só consegue consultar, inserir, atualizar ou apagar seus próprios registros (`(select auth.uid()) = user_id`).
- **Gerenciamento de Sessão**:
  - Tokens JWT (`access_token` e `refresh_token`) são gerenciados pelo cliente `SupabaseCloud`.
  - Renovação automática de token antes da expiração.
  - Exclusão com confirmação remota quando online, evitando inconsistência de estado entre cliente e servidor.

---

## 4. Camada Desktop (`desktop/`)

- **Runtime**: Electron 33.
- **Segurança de Execução**:
  - `nodeIntegration: false`
  - `contextIsolation: true`
  - `sandbox: true`
  - `preload.js` mínimo expondo apenas APIs de diálogo nativo de arquivos e validação de caminhos seguros.
  - Bloqueio de navegação externa arbitrária e injeção de Content Security Policy (CSP).
- **Distribuição**: Empacotado via `electron-builder` para Linux (AppImage e .deb), Windows (instalador NSIS) e macOS (.dmg).

---

## 5. Camada Android (`android/`)

- **Tecnologia**: Kotlin com Jetpack Compose Material 3.
- **Identificador**: `br.com.fakeloc.app`, visando minSdk 26 e targetSdk 35.
- **Escopo**: Demonstração de simulação interna de coordenadas em tela. Não implementa `setTestProviderLocation` e não substitui o GPS do sistema operacional.
