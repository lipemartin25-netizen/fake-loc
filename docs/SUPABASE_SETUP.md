# Supabase do Fake Loc

O projeto Supabase usado pela integração é `cejivififvlhnwyeajwc` (`https://cejivififvlhnwyeajwc.supabase.co`). A aplicação envia dados para a nuvem somente depois que a pessoa entra em sua conta e aciona **Sincronizar favoritos**. Coordenadas de simulação, consultas de busca e histórico não são enviados. O modo local continua disponível sem conta.

## Estado aplicado

- O esquema `public` foi substituído: tabelas antigas de fotos/finanças foram removidas e substituídas por `favorites`, `routes` e `movement_profiles`.
- Auth e Storage do projeto não foram apagados. O gatilho legado que tentava gravar em `public.profiles` foi removido para permitir novos cadastros.
- RLS está habilitado nas três tabelas. As políticas limitam leitura e escrita ao `auth.uid()` dono da linha. A chave usada no navegador é publishable; não há service-role key no código.
- O gatilho legado que ativa RLS em novas tabelas foi mantido, mas execução direta foi revogada para `PUBLIC`, `anon` e `authenticated`.
- Após essa correção, os advisors de segurança não apontam mais rotinas `SECURITY DEFINER` públicas; permanecem dois avisos sobre extensões antigas `vector` e `pg_trgm` instaladas em `public`. Elas foram mantidas para evitar alterar dependências gerenciadas do projeto e não são usadas pelo esquema Fake Loc.
- Cada linha inclui `schema_version`. IDs são UUIDs estáveis; tempos são `timestamptz` UTC. Coordenadas usam latitude e longitude em graus decimais.
- Rotas e perfis têm tabelas preparadas, mas a interface ainda não os sincroniza. Não há sincronização de histórico/telemetria.
- A sincronização de favoritos combina registros por ID, envia os locais e incorpora registros remotos visíveis pelas políticas. Exclusões feitas enquanto offline são guardadas localmente até uma sincronização.

## Configuração da aplicação

Copie `web/.env.example` para `web/.env.local`. Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` com os valores do projeto. O `.env.local` é ignorado pelo Git. A chave publishable pode estar no bundle web; uma chave `service_role`/secret nunca pode.

Para deploy Vercel, defina as mesmas variáveis para o projeto/branch de produção e faça um novo deploy. Sem elas, o modo local funciona e a seção de nuvem informa que a nuvem não está configurada. O projeto não recebe dados até que alguém crie/acesse uma conta e peça a sincronização.

Auth de e-mail depende das configurações de confirmação e provedores no painel Supabase. Se a confirmação de e-mail estiver ligada, a pessoa deve confirmar o endereço antes de entrar. Não foram criados usuários de teste nem alteradas essas opções de autenticação.

## Identidade do projeto

Não existe operação de renomear projeto nesta conexão Supabase. Para trocar o título exibido de “lipemartin25-netizen's Project newfck photos” para “Fake Loc”, faça isso no dashboard em **Project Settings → General → Project name**. O ID e URL do projeto não mudam. O nome da aplicação e a descrição do esquema já usam Fake Loc.

## Migrations e recuperação

As mudanças no banco foram executadas como migrations `fake_loc_initial_schema`, `remove_legacy_product_hooks` e `restrict_rls_event_trigger_execution`. Os arquivos de referência SQL ficam em `supabase/`. A história antiga de migrations foi preservada para auditoria; não tente reaplicá-la ao novo esquema. O banco não tem dados de usuário Fake Loc no momento da configuração.

Antes de uma mudança futura, exporte os dados com backup do Supabase ou use o backup manual da aplicação. Para restaurar favoritos de uma conta, entre na conta e use a sincronização. Não salve credenciais no repositório.
