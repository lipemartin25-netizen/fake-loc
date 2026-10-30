# Matriz de aceite (revisão inicial)

Estados usados: Implementado e testado; Implementado, não executado no ambiente; Parcial; Bloqueado; Fora do escopo.

| Requisito | Android | Web | Estado / teste / evidência / limitação |
|---|---|---|---|
| Mapa | Parcial | Parcial | Web canvas ilustrativo clicável; sem tiles/zoom/pan real. Android sem mapa. |
| Coordenadas manuais | Parcial | Implementado | Web valida limites e vírgula decimal; testes escritos, não executados. Android valida faixa em tela. |
| Teleporte interno | Parcial | Implementado | Atualiza posição local do simulador; web sem GPS sistêmico. |
| Busca explícita | Bloqueado | Bloqueado | Provedor e política ainda não configurados. |
| Favoritos | Bloqueado | Parcial | Web localStorage persistido; adicionar e excluir, sem import/export. |
| Joystick | Bloqueado | Bloqueado | Não implementado. |
| Rota de dois pontos | Bloqueado | Parcial | Movimento linear geodésico no motor UI; sem editor de rota. |
| Rota multiponto | Bloqueado | Bloqueado | Não implementado. |
| Perfis | Bloqueado | Bloqueado | Velocidade numérica simples na web. |
| Pausa/retomada | Parcial | Parcial | Controle de estado simples; testes ainda não executados. |
| Loop | Bloqueado | Bloqueado | Não implementado. |
| Ida/volta | Bloqueado | Bloqueado | Não implementado. |
| GPX | Bloqueado | Bloqueado | Não implementado. |
| JSON | Bloqueado | Parcial | Contrato schema de favoritos; interface de importação/exportação pendente. |
| Backup | Bloqueado | Bloqueado | Não implementado. |
| Histórico | Bloqueado | Bloqueado | Não implementado. |
| Persistência | Bloqueado | Parcial | Web localStorage; IndexedDB e persistência Android pendentes. |
| Diagnóstico | Bloqueado | Bloqueado | Script PowerShell inicial existe; não executado em Windows. |
| Mock Android | Bloqueado | Fora do escopo | Adaptador oficial ainda não implementado; web não altera GPS do dispositivo. |
| Serviço em primeiro plano | Bloqueado | Fora do escopo | Android sem serviço; não afirmado como funcional. |
| Acessibilidade | Parcial | Parcial | Labels básicos, alertas e botões nativos; auditoria pendente. |
| Build | Bloqueado | Bloqueado | Web sem dependências instaladas; Android sem JDK/SDK. |
| Instalação | Bloqueado | Fora do escopo | APK não gerado; não testado em aparelho. |
