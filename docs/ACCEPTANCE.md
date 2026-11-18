# Matriz de Aceite e Conformidade Multiplataforma

Critérios e estados:
- **Implementado e testado**: Funcionalidade completa com testes automatizados executados e aprovados.
- **Implementado**: Funcionalidade visual/interativa implementada no código e verificada em execução/build.
- **Parcial**: Funcionalidade básica implementada, com melhorias ou expansões previstas para versões futuras.
- **Não implementado / Futuro**: Previsto no roadmap do produto, mas ainda não presente nesta versão.
- **Fora do escopo**: Não aplicável ou deliberadamente não suportado por razões de segurança ou restrições de plataforma.

---

## Tabela de Funcionalidades por Plataforma

| Requisito / Funcionalidade | Android | Web | Desktop | Detalhes Técnicos e Limites |
| :--- | :--- | :--- | :--- | :--- |
| **Mapa Interativo (Tiles OSM)** | Não implementado (sem mapa visual) | Implementado | Implementado | Leaflet com tiles OpenStreetMap, marcador com pulso, destino arrastável e renderização de rota. |
| **Mapa Esquemático (Fallback)** | Não aplicável | Implementado | Implementado | Renderização em CSS/SVG pura sem necessidade de conexão externa. |
| **Entrada Manual de Coordenadas** | Implementado | Implementado e testado | Implementado e testado | Validação de limites (latitude ±90°, longitude ±180°) e suporte a vírgula/ponto decimal. |
| **Teleporte Interno** | Implementado | Implementado e testado | Implementado e testado | Atualiza imediatamente a posição interna da simulação (sem afetar GPS global). |
| **Joystick Virtual** | Não implementado | Implementado | Implementado | Controle direcional contínuo por ponteiro/toque e teclado (WASD/setas) com limitação de frame. |
| **Simulação de Rota (2 Pontos)** | Implementado | Implementado e testado | Implementado e testado | Movimento linear geodésico interpolado ao longo do arco de grande círculo. |
| **Pausa, Retomada e Parada** | Implementado | Implementado e testado | Implementado e testado | Controle de estado com preservação de progresso e reinício limpo. |
| **Favoritos Locais** | Não implementado | Implementado e testado | Implementado e testado | Persistência local (`localStorage`), criação, exibição e exclusão. |
| **Importação / Exportação GPX** | Não implementado | Implementado e testado | Implementado e testado | GPX 1.1 compatível, com sanitização de entidades XML externas (anti-XXE). |
| **Importação / Exportação JSON** | Não implementado | Implementado e testado | Implementado e testado | Formato JSON versionado (schema v1) com validação de campos e descarte de duplicatas. |
| **Sincronização Nuvem (Supabase)** | Não aplicável | Implementado e testado | Implementado e testado | Autenticação por e-mail, isolamento rigoroso por RLS, exclusão confirmada e fila offline. |
| **Rotas Multiponto e Perfis** | Não implementado | Futuro | Futuro | Tabelas no banco de dados já preparadas; interface prevista para versões futuras. |
| **Empacotamento e CI** | Aprovado em CI | Aprovado em CI | Aprovado em CI | Workflows GitHub Actions gerando APK debug e instaladores (.exe, .AppImage, .deb, .dmg). |
| **Mock Global de GPS** | Fora do escopo | Fora do escopo | Fora do escopo | A ferramenta não substitui o provedor de localização do SO nem evade controles de terceiros. |
