# Estado da reconstrução

## Inspeção

- Código consolidado em `/home/felipe/Documentos/gps fak`; branch `codex/fake-loc-rebuild`, último commit local `e34e9f2` (integração Supabase e scripts de publicação).
- Pasta de destino estava vazia. `/home/felipe/meu-projeto` e checkout pai `/home/felipe/projetos` foram preservados. O commit local `b3b8a0d` foi integrado como segundo pai de `f9d9925`, sem alterar diretórios irmãos.
- `gh auth status` passou, mas DNS para `github.com` falhou. Pedido de execução fora do sandbox foi recusado pela política da sessão; push/PR não confirmados.
- Node v22.23.4/npm 10.9.9 usados na validação atual; OpenJDK 21.0.12.1; Android SDK não localizado.
- Validação atual: ESLint, typecheck, 12 testes e build Vite passaram; detalhes em [TEST-REPORT.md](TEST-REPORT.md).
- Servidor Vite não pôde abrir socket (EPERM) em 0.0.0.0 nem em 127.0.0.1. Nenhum endereço HTTP está ativo/verificado.
- Gradle Wrapper 8.9 existe; download bloqueado com `SocketException: Operation not permitted`. SDK Android ausente da sessão; APK não gerado.

## Implementação

| Área | Estado | Evidência/limite |
|---|---|---|
| Motor geográfico web | Implementado e testado | Geografia, validação e antimeridiano; 3 testes unitários |
| Web vertical | Implementado e testado | Coordenadas, telemetria, favoritos, GPX, JSON e cliente Supabase isolado; veja relatório de 12 testes |
| Mapa | Parcial | Canvas esquemático interativo, sem tiles |
| Busca externa, GPX/JSON, rotas | Parcial | GPX e JSON de favoritos implementados na web; busca e editor/playback de rotas não implementados |
| Android | Parcial | Compose, movimento interno básico e motor geográfico; Geo compilado isoladamente; build bloqueado por SDK/rede e localização mock ainda não ligada |
| Supabase | Parcial | Projeto `cejivififvlhnwyeajwc` substituído por schema Fake Loc com RLS; web inclui Auth e sincronização opt-in de favoritos. Endpoints Auth/Data API não foram validados diretamente e rotas/perfis ainda não sincronizam pela interface. |
| GitHub/Vercel | Bloqueado | CLI GitHub autenticada, mas DNS/rede impede consultar/push remoto; Vercel CLI ausente e deploy não executado |
| CI e APK | Bloqueado | Cadeia Android indisponível; dependências de rede não verificáveis |

A localização simulada não foi validada em aparelho. O título do projeto Supabase no dashboard também não foi renomeado porque a conexão não disponibiliza essa operação; instrução manual em [SUPABASE_SETUP.md](SUPABASE_SETUP.md).
