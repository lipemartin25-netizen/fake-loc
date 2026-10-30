# Fake Loc

Ferramenta local de simulação de localização para desenvolvimento, demonstração e testes autorizados. Não altera o GPS global no navegador e não inclui integração com jogos ou mecanismos de ocultação.

## Estado desta reconstrução

O projeto foi consolidado em `/home/felipe/Documentos/gps fak` preservando o histórico local da reconstrução e integrando o commit base `b3b8a0d` do checkout ligado ao remoto. O estado atual do GitHub não pôde ser consultado neste ambiente. Consulte [docs/STATE.md](docs/STATE.md) e [docs/ACCEPTANCE.md](docs/ACCEPTANCE.md) para implementação, validação e pendências.

## Web

Requer Node.js 22.x. Em `web/`: `npm ci`, `npm run dev`, `npm run lint`, `npm run typecheck`, `npm test` e `npm run build`. Favoritos são armazenados localmente no navegador. O mapa é esquemático, sem tiles; busca geográfica e mapas reais ainda não estão configurados. Para deploy, siga [docs/DEPLOY.md](docs/DEPLOY.md).

## Android

Aplicativo nativo Kotlin/Compose parcial. Requer JDK 17 ou superior e Android SDK 35 conforme [android/README.md](android/README.md). Localização simulada do sistema ainda não está implementada. O APK debug não foi gerado neste ambiente.

## Privacidade e limites

Nenhuma telemetria externa está configurada. A simulação web não altera o GPS do aparelho. Não há garantia de compatibilidade com aplicativos terceiros. Distâncias usam Haversine sobre esfera de raio 6.371.008,8 m; não são distâncias rodoviárias.
