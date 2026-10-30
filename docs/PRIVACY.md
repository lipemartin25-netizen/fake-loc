# Privacidade e segurança

Nenhuma telemetria externa está configurada. Coordenadas não são enviadas a serviço remoto. Favoritos da versão web ficam no armazenamento local do navegador e podem ser apagados limpando os dados do site. Não há localização sistêmica no navegador. O aplicativo Android atual é somente interno; ativação de mock oficial é pendência.

Uma futura busca/mapa por terceiros enviará consultas ou coordenadas ao provedor e exigirá aviso, política de uso, atribuição e controles de cache apropriados.
# Nuvem opcional

A web continua funcionando localmente sem Supabase. Com uma conta e ação explícita de sincronização, favoritos são enviados ao projeto Supabase do Fake Loc para uso em outros dispositivos. A aplicação não sincroniza coordenada atual, buscas, rotas, perfis ou telemetria neste momento. E-mail e tokens de sessão são processados pelo Supabase Auth; sessão fica no armazenamento local do navegador. A chave frontend é publishable e as políticas RLS restringem os registros ao usuário autenticado. Ver `SUPABASE_SETUP.md`.
