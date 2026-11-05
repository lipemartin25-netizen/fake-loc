# Matriz de aceite (revisão inicial)

Estados usados: Implementado e testado; Implementado, não executado no ambiente; Parcial; Bloqueado; Fora do escopo.

| Requisito | Android | Web | Desktop | Estado / teste / evidência / limitação |
|---|---|---|---|---|
| Mapa | Parcial (sem mapa) | Implementado com tiles | Implementado (compartilhado) | Web e Desktop com Leaflet e OpenStreetMap tiles, marcador pulsante, destino arrastável e polylines. Android sem mapa visual. |
| Coordenadas manuais | Implementado com testes | Implementado e testado | Implementado e testado | Web valida limites/vírgula decimal; Android com testes unitários em GeoTest.kt; Desktop compartilha validação. |
| Teleporte interno | Parcial | Implementado e testado | Implementado e testado | Ação atualiza posição simulada instantaneamente; sem injeção sistêmica no modo web/desktop. |
| Busca explícita | Bloqueado | Bloqueado | Bloqueado | Provedor e política de geocodificação ainda não configurados. |
| Favoritos | Bloqueado | Implementado e testado | Implementado | Web localStorage (migração para IndexedDB planejada); exportação/importação JSON versionado; sincronização opt-in Supabase. |
| Joystick | Bloqueado | Implementado e testado | Implementado | Controle analógico por ponteiro/toque e teclado W/A/S/D ou setas; delta com teto monotônico (max 200ms) prevenindo saltos; ignora teclas dentro de inputs. |
| Rota de dois pontos | Parcial | Implementado e testado | Implementado | Movimento linear geodésico por interpolação de grande círculo. |
| Rota multiponto | Bloqueado | Bloqueado | Bloqueado | Não implementado. |
| Perfis | Bloqueado | Bloqueado | Bloqueado | Velocidade configurável em m/s e km/h. |
| Pausa/retomada | Parcial | Implementado e testado | Implementado e testado | Controle de estado com teste unitário confirmando pausa sem deslocamento. |
| Loop e Ida/volta | Bloqueado | Bloqueado | Bloqueado | Não implementado. |
| GPX | Bloqueado | Implementado e testado | Implementado | Importação/exportação GPX 1.1 com sanitização contra DTD/XXE; renderização de waypoints e rotas no mapa Leaflet. |
| JSON | Bloqueado | Implementado e testado | Implementado | Importação/exportação versionada (schema v1) de favoritos com validação e detecção de duplicatas. |
| Backup | Bloqueado | Parcial | Parcial | Exportação de favoritos em JSON e GPX; backup de rotas/histórico pendente. |
| Histórico | Bloqueado | Bloqueado | Bloqueado | Não implementado. |
| Persistência | Bloqueado | Parcial (localStorage) | Parcial | Web/Desktop usam localStorage (IndexedDB/SQLite estruturado como evolução planejada); Android Room pendente. |
| Conta e nuvem Supabase | Fora do escopo | Implementado e testado parcialmente | Implementado | Auth por e-mail e merge de favoritos por UUID; testes HTTP simulados. |
| Mock Android | Bloqueado | Não aplicável | Não aplicável | Adaptador LocationManager.setTestProviderLocation planejado para fase nativa. |
| Serviço em primeiro plano | Bloqueado | Não aplicável | Não aplicável | Foreground Service Android com notificação planejado para fase nativa. |
| Build e CI | Aprovado em CI | Aprovado em CI | Aprovado em CI | Workflows GitHub Actions aprovados gerando APK debug e instaladores Windows (.exe), Linux (AppImage + .deb) e macOS (.dmg). |
