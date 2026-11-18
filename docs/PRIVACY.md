# Política de Privacidade e Diretrizes de Segurança — Fake Loc

Este documento esclarece formalmente os princípios de privacidade, tratamento de dados e limitações de segurança do **Fake Loc**.

---

## 1. Princípios Fundamentais de Privacidade

1. **Operação Local por Padrão**:
   - Toda a simulação matemática, rota e telemetria ocorrem estritamente na memória e no navegador/dispositivo do usuário.
   - Nenhuma coordenada de localização em tempo real, busca ou histórico é enviada para servidores ou serviços analíticos.
2. **Ausência de Telemetria e Rastreadores**:
   - O projeto não inclui Google Analytics, trackers, pixels de conversão ou telemetria em nenhuma plataforma (Web, Desktop ou Android).
3. **Isolamento Sistêmico**:
   - O software não interage com o hardware de GPS real do computador ou do smartphone. Ele não altera a localização global do sistema operacional nem engana outros aplicativos instalados.

---

## 2. Nuvem Opcional (Supabase)

A sincronização com a nuvem é um recurso voluntário (*opt-in*):
- **Dados Coletados com Conta**:
  - E-mail e senha (criptografada pelo Supabase Auth via Argon2/Bcrypt).
  - Lista de favoritos salvos (nome, latitude, longitude, tags e data de criação).
- **Dados NÃO Coletados**:
  - Trajetos percorridos, velocidade, rumo e telemetria em tempo real.
- **Isolamento de Acesso**:
  - As tabelas são protegidas por Row Level Security (RLS) no PostgreSQL. Cada usuário autenticado só pode consultar, modificar e excluir os próprios registros.
  - Acesso não autenticado (`anon`) é completamente bloqueado nas tabelas de dados.

---

## 3. Armazenamento Local e Segurança de Sessão

- **Web e Desktop**:
  - Favoritos locais são persistidos em `localStorage` sob a chave `fake-loc-favorites-v1`.
  - Sessões autenticadas do Supabase (`access_token`, `refresh_token`) são gravadas no `localStorage` sob a chave `fake-loc-supabase-session-v1`.
  - **Limitação Conhecida**: No modelo SPA (Single Page Application), dados no `localStorage` estão expostos caso ocorra uma falha grave de XSS (Cross-Site Scripting). O Fake Loc mitiga isso evitando renderização de HTML não confiável (`dangerouslySetInnerHTML`), desabilitando injeção de DTD/XML externa e aplicando Content Security Policy rígida.
  - O usuário pode revogar e apagar a sessão a qualquer momento clicando em **Sair da conta** ou limpando os dados de navegação.

---

## 4. Limitações de Responsabilidade e Uso

O Fake Loc destina-se a fins educativos, de demonstração, desenvolvimento de software e testes autorizados. Ele não fornece garantias para navegação física real nem foi projetado para operações críticas de segurança da vida.
