# Matriz de aceite (revisão inicial)

Estados usados: Implementado e testado; Implementado, não executado no ambiente; Parcial; Bloqueado; Fora do escopo.

| Requisito | Android | Web | Estado / teste / evidência / limitação |
|---|---|---|---|
| Mapa | Parcial | Parcial | Web canvas ilustrativo clicável; sem tiles/zoom/pan real. Android sem mapa. |
| Coordenadas manuais | Implementado, não executado no ambiente | Implementado e testado | Web valida limites/vírgula decimal; Android valida limites, app ainda não construído. |
| Teleporte interno | Parcial | Implementado e testado | Ação web atualiza posição simulada; web sem GPS sistêmico. |
| Busca explícita | Bloqueado | Bloqueado | Provedor e política ainda não configurados. |
| Favoritos | Bloqueado | Implementado e testado | Web localStorage; criar, selecionar, excluir, JSON versionado; sincronização opt-in Supabase com RLS e teste de cliente isolado. |
| Joystick | Bloqueado | Bloqueado | Não implementado. |
| Rota de dois pontos | Bloqueado | Parcial | Movimento linear geodésico no motor UI; sem editor de rota. |
| Rota multiponto | Bloqueado | Bloqueado | Não implementado. |
| Perfis | Bloqueado | Bloqueado | Velocidade numérica simples na web. |
| Pausa/retomada | Parcial | Implementado e testado | Controle de estado simples; teste com relógio falso confirma pausa sem deslocamento. |
| Loop | Bloqueado | Bloqueado | Não implementado. |
| Ida/volta | Bloqueado | Bloqueado | Não implementado. |
| GPX | Bloqueado | Parcial | Web importa/exporta GPX 1.1, waypoints, rotas e segmentos separados; round-trip testado. Playback e escolha de múltiplas rotas não implementados. |
| JSON | Bloqueado | Implementado e testado | Importação/exportação versionada de favoritos; valida registros, limites e duplicatas. |
| Backup | Bloqueado | Parcial | Exporta favoritos; backup completo de rotas/perfis/preferências/histórico ausente. |
| Histórico | Bloqueado | Bloqueado | Não implementado. |
| Persistência | Bloqueado | Parcial | Favoritos web em localStorage; IndexedDB e persistência Android pendentes. |
| Conta e nuvem Supabase | Fora do escopo | Implementado e testado parcialmente | Auth por e-mail e merge de favoritos no cliente; testes HTTP simulados. Sem teste de conta real neste ambiente. Rotas/perfis têm schema RLS, ainda sem sync de UI. |
| Conta e nuvem Supabase | Fora do escopo | Implementado e testado parcialmente | Auth por e-mail e merge de favoritos no cliente; testes HTTP simulados. Sem teste de conta real neste ambiente. Rotas/perfis têm schema RLS, ainda sem sync de UI. |
| Diagnóstico | Bloqueado | Bloqueado | Script PowerShell inicial existe; não executado em Windows. |
| Mock Android | Bloqueado | Fora do escopo | Adaptador oficial ainda não implementado; web não altera GPS do dispositivo. |
| Serviço em primeiro plano | Bloqueado | Fora do escopo | Android sem serviço; não afirmado como funcional. |
| Acessibilidade | Parcial | Parcial | Labels básicos, alertas e botões nativos; auditoria pendente. |
| Build | Bloqueado | Implementado e testado | Build web Vite passou; Android bloqueado por SDK/rede Gradle. |
| Instalação | Bloqueado | Fora do escopo | APK não gerado; não testado em aparelho. |
