# Guia de Configuração e Arquitetura Supabase — Fake Loc

Este documento detalha como configurar, gerenciar e aplicar o esquema do Supabase para o **Fake Loc** com segurança e de forma não destrutiva.

---

## 1. Escopo e Princípios da Integração com Nuvem

- **Opcionalidade Total**: O Fake Loc opera de forma 100% local por padrão. A integração com Supabase só é acionada se o usuário explicitamente criar uma conta e optar por sincronizar dados.
- **Dados Sincronizados**: Apenas favoritos criados pelo usuário (`favorites`). Rotas e perfis de movimentação possuem tabelas preparadas para versões futuras.
- **Privacidade por Padrão**: Coordenadas de simulação em tempo real, telemetria, buscas e históricos **nunca** são transmitidos para o servidor.
- **Segurança e Isolamento RLS**: Todas as tabelas têm Row Level Security (RLS) obrigatório. Usuários só podem ler, inserir, modificar e apagar seus próprios registros (`auth.uid() = user_id`). Chaves anônimas (`anon`) não possuem permissão de leitura nem escrita.

---

## 2. Como Configurar um Novo Projeto Supabase (Recomendado para Produção/Comercial)

> [!IMPORTANT]
> **Nunca reutilize um banco de dados em produção compartilhado com outros sistemas.** Crie sempre um projeto Supabase novo e exclusivo para o Fake Loc.

### Passo a passo no painel do Supabase:
1. Acesse o painel do Supabase ([supabase.com](https://supabase.com)) e clique em **New project**.
2. Escolha o nome da organização, defina o nome do projeto (ex.: `fake-loc-prod`) e gere uma senha de banco segura (guarde-a em seu cofre de senhas).
3. Selecione a região mais próxima do seu público (ex.: `sa-east-1` / São Paulo).
4. Aguarde a inicialização da instância.
5. No menu lateral esquerdo, vá em **SQL Editor** e clique em **New query**.
6. Cole o conteúdo de [supabase/schema.sql](file:///home/felipe/projetos/gps%20fak/supabase/schema.sql) e clique em **Run**.
   - O script executará de forma idempotente e não destrutiva (`CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, políticas com checagem segura).
7. Em **Project Settings → API**:
   - Copie o **Project URL** (ex.: `https://<seu-project-id>.supabase.co`).
   - Copie a chave **anon / public** (`anon key`).
   - **NUNCA** utilize ou exponha a chave `service_role` no código front-end ou em clientes distribuídos.

---

## 3. Configuração das Variáveis de Ambiente

No ambiente de desenvolvimento local:
1. Copie o arquivo de exemplo:
   ```bash
   cp web/.env.example web/.env.local
   ```
2. Abra `web/.env.local` e configure:
   ```env
   VITE_SUPABASE_URL=https://<seu-project-id>.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_<sua-chave-anon>
   ```
3. O arquivo `web/.env.local` está no `.gitignore` e não deve ser comitado.

Para publicação na Vercel:
- Em **Project Settings → Environment Variables**, cadastre:
  - `VITE_SUPABASE_URL` para ambientes *Production* e *Preview*.
  - `VITE_SUPABASE_PUBLISHABLE_KEY` para ambientes *Production* e *Preview*.

---

## 4. Auditoria de Segurança: Risco Histórico e Plano de Recuperação

### Contexto do Risco Anterior
No desenvolvimento inicial do protótipo, o arquivo `supabase/schema.sql` continha comandos `DROP TABLE IF EXISTS ... CASCADE` em lote para remover tabelas residuais de uma aplicação anterior de fotos e finanças.
* Esse script foi **totalmente substituído** por DDL seguro e não destrutivo nesta revisão.
* Nenhum comando destrutivo deve ser mantido como padrão do produto.

### Plano de Recuperação (Caso tenha havido execução acidental prévia)
Caso alguém tenha acidentalmente aplicado a versão legada do script contra um banco Supabase em uso compartilhado:
1. **Não execute novas gravações**: Interrompa acessos imediatos para evitar sobrescrita de logs.
2. **Restauro via PITR (Point-In-Time-Recovery)**:
   - Se o plano do Supabase for Pro ou Enterprise, acesse **Database → Backups → Point-in-time recovery** no painel e restaure para o timestamp imediatamente anterior à execução da migração.
3. **Restauro via Backup Diário**:
   - Em planos Free/Standard, acesse **Database → Backups → Scheduled backups** e selecione o backup mais recente para download ou restauração.
4. **Verificação de Dados**:
   - Verifique a integridade das tabelas e garanta que o projeto do Fake Loc seja migrado para uma instância de banco 100% isolada.

---

## 5. Armazenamento de Sessão e Limitações de Segurança

1. **Tokens de Acesso e Refresh**:
   - O cliente web armazena os tokens de sessão (`access_token`, `refresh_token`) em `localStorage` sob a chave `fake-loc-supabase-session-v1`.
   - **Limitação Conhecida**: Em SPAs puramente client-side, o `localStorage` pode ser lido por scripts que executem na mesma origem se houver vulnerabilidade de XSS (Cross-Site Scripting).
   - **Mitigações Implementadas**:
     - O Fake Loc não usa `dangerouslySetInnerHTML`, nem avalia scripts dinâmicos de terceiros.
     - As Content Security Policies (CSP) bloqueiam scripts em linha e origens não autorizadas.
     - A chave publishable só permite operações explicitamente autorizadas por RLS para o `auth.uid()` logado.
     - Tokens nunca são expostos em logs do navegador nem no console.
