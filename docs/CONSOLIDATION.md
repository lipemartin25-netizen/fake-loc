# Consolidação

Data: 2026-10-30.

## Origem principal preservada

- Origem de código/histórico: `/home/felipe/meu-projeto`.
- Branch e commit copiados: `codex/fake-loc-rebuild`, `8bab1b192a3ca9ae082e86f5e902ea8e9997cc07`.
- Histórico incluído: `9185436` → `94500a7` → `8bab1b1`.
- Cópia feita com `git clone --no-hardlinks` para `/home/felipe/Documentos/gps fak`, mantendo a origem sem alterações.
- A pasta definitiva existia e estava vazia antes da cópia. O clone contém `.git` completo; `node_modules`, `dist`, SDKs e caches não foram copiados.
- A árvore de código copiada não tinha links simbólicos para fora. Após `npm ci`, apenas links executáveis padrão em `web/node_modules/.bin` apontam para pacotes do próprio `web/node_modules`; não há dependência de outro projeto.

## Checkout GitHub local encontrado

`/home/felipe/projetos` é o checkout pai associado ao remoto GitHub confirmado. Sua branch `main` está no commit local `b3b8a0d` (`first commit`), que contém somente `README.md` com `# fake-loc`. Tem cinco diretórios de outros projetos como arquivos não rastreados; nenhum deles foi copiado ou movido. O checkout pai foi preservado sem alterações.

O commit `b3b8a0d` será integrado ao histórico consolidado preservando a descrição útil já escrita para o Fake Loc. O estado atual no servidor GitHub não foi consultável porque DNS falhou; o README local não é prova do conteúdo atual do remoto.

## Subdiretório Git vazio encontrado

`/home/felipe/projetos/fake-loc` contém somente metadados Git, nenhum commit, zero objetos Git e nenhum arquivo de trabalho. Foi preservado intacto; não foi usado para substituir o checkout pai.

## Remoto e referências

O remoto `origin` na pasta definitiva foi configurado para `git@github.com:lipemartin25-netizen/fake-loc.git`. A consulta ao remoto falhou porque `github.com` não resolve neste ambiente, então branches e commits atuais do GitHub permanecem não verificados. As referências `refs/local-source/*` preservam ponteiros locais copiados; não são afirmações sobre o estado remoto.

## Fontes preservadas

- `/home/felipe/meu-projeto`: preservada integralmente; nenhuma limpeza/movimentação realizada.
- `/home/felipe/projetos`: preservada integralmente, inclusive README, commit e diretórios irmãos.
- `/home/felipe/projetos/fake-loc`: preservada integralmente; subdiretório checkout vazio.
- `/home/felipe/Documentos/gps fak`: pasta canônica consolidada; contém as mudanças subsequentes de organização/publicação.

Nenhum arquivo de `neurafin`, Android Studio, JDK, SDK ou caches foi movido.
