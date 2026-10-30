# Dependências de terceiros

As dependências web estão fixadas em `web/package.json` e `web/package-lock.json`; `npm ci` reproduz a árvore travada. O lockfile preserva metadados de licença publicados pelos pacotes. Dependências diretas selecionadas usam licenças permissivas (React MIT, Vite MIT, TypeScript Apache-2.0, Vitest MIT, ESLint MIT). Revise as licenças transitivas antes de redistribuir binários.

Android usa bibliotecas AndroidX/Jetpack Compose e Gradle. Seus avisos de licença acompanham os artefatos oficiais. O Gradle Wrapper é o oficial, fixado em 8.9.

Não há mapas, fontes ou APIs externas embutidos no fluxo básico. A tela web usa fontes do sistema e um mapa esquemático próprio.
