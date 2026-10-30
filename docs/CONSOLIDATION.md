# Consolidação

Data: 2026-10-30.

## Origem principal preservada

- Origem de código/histórico: `/home/felipe/meu-projeto`.
- Branch e commit copiados: `codex/fake-loc-rebuild`, `8bab1b192a3ca9ae082e86f5e902ea8e9997cc07`.
- Histórico incluído: `9185436` → `94500a7` → `8bab1b1`.
- Cópia feita com `git clone --no-hardlinks` para `/home/felipe/Documentos/gps fak`, mantendo a origem sem alterações.
- A pasta definitiva existia e estava vazia antes da cópia. O clone contém `.git` completo; `node_modules`, `dist`, SDKs e caches não foram copiados.
- A cópia é independente: `find` não encontrou links simbólicos; as dependências são instaladas pelo `web/package-lock.json`.

## Outra origem encontrada

`/home/felipe/projetos/fake-loc` contém somente metadados Git, nenhum commit, zero objetos Git e nenhum arquivo de trabalho. A configuração desse checkout identifica `git@github.com:lipemartin25-netizen/fake-loc.git`. A origem foi preservada intacta; não foi usada para substituir o histórico com código.

## Remoto e referências

O remoto `origin` na pasta definitiva foi configurado para `git@github.com:lipemartin25-netizen/fake-loc.git`, com base na configuração local acima. A consulta ao remoto falhou porque `github.com` não resolve neste ambiente, então branches e commits atuais do GitHub permanecem não verificados. As referências `refs/local-source/main` e `refs/local-source/codex/fake-loc-rebuild` preservam os ponteiros locais copiados; não são afirmações sobre o estado remoto.

## Fontes preservadas

- `/home/felipe/meu-projeto`: preservada integralmente; nenhuma limpeza/movimentação realizada.
- `/home/felipe/projetos/fake-loc`: preservada integralmente; checkout vazio, útil como registro da URL remota.
- `/home/felipe/Documentos/gps fak`: pasta canônica consolidada; contém as mudanças subsequentes de organização/publicação.

Nenhum arquivo de `neurafin`, Android Studio, JDK, SDK ou caches foi movido.
