# Dependências de Terceiros e Licenças

Este documento cataloga as bibliotecas, serviços externos e respectivas licenças adotadas no projeto **Fake Loc**.

---

## 1. Dependências da Aplicação Web (`web/`)

| Pacote | Função | Licença |
| :--- | :--- | :--- |
| `react` / `react-dom` | Renderização da interface de usuário | MIT |
| `leaflet` | Biblioteca interativa para visualização de mapas | BSD-2-Clause |
| `@types/leaflet` | Definições de tipos TypeScript para Leaflet | MIT |
| `vite` | Empacotador e servidor de desenvolvimento web | MIT |
| `typescript` | Compilador e verificador de tipos estáticos | Apache-2.0 |
| `vitest` | Framework de testes unitários | MIT |
| `jsdom` | Ambiente de simulação de DOM para testes | MIT |
| `eslint` | Linter e analisador estático de código | MIT |

### Serviços e Tiles de Mapa
- **OpenStreetMap Tiles**: Servidos a partir de `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`.
  - Licença dos dados: [Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/).
  - Atribuição obrigatória mantida na interface: `© OpenStreetMap contributors`.

---

## 2. Dependências da Aplicação Desktop (`desktop/`)

| Pacote | Função | Licença |
| :--- | :--- | :--- |
| `electron` | Framework para desktop baseado em Chromium e Node.js | MIT |
| `electron-builder` | Sistema de empacotamento e distribuição de executáveis | MIT |
| `electron-is-dev` | Utilitário de detecção de ambiente de desenvolvimento | MIT |

---

## 3. Dependências da Aplicação Android (`android/`)

| Biblioteca | Função | Licença |
| :--- | :--- | :--- |
| `androidx.compose.ui` / `material3` | Framework declarativo de interface de usuário | Apache-2.0 |
| `androidx.core:core-ktx` | Extensões Kotlin para APIs do Android | Apache-2.0 |
| `kotlinx.coroutines` | Primitivas para concorrência assíncrona | Apache-2.0 |
| `Gradle Wrapper 8.9` | Orquestrador oficial de build Android | Apache-2.0 |

---

## 4. Política de Conformidade

- Todas as dependências primárias do projeto adotam licenças de código aberto permissivas (MIT, Apache-2.0, BSD-2-Clause).
- Nenhuma biblioteca ou serviço requer evasão de proteções ou violação de termos de uso de terceiros.
- A árvore travada em `package-lock.json` e o Gradle Wrapper oficial garantem reprodutibilidade exata nas compilações.
