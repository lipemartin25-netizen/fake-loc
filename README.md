# Fake Loc

Ferramenta local de simulação de localização para desenvolvimento, demonstração e testes autorizados. Não altera o GPS global no navegador e não inclui integração com jogos ou mecanismos de ocultação.

## Estado desta reconstrução

O checkout disponível continha apenas um README e um commit local (`9185436`), sem remoto, tags ou código recuperável. A consulta ao repositório GitHub falhou por indisponibilidade de DNS. Veja [docs/STATE.md](docs/STATE.md) para o inventário honesto e pendências.

## Web

Requer Node.js 20+. Em `web/`: `npm ci`, `npm run dev`, `npm run lint`, `npm run typecheck`, `npm test` e `npm run build`. Favoritos são armazenados localmente no navegador. O mapa esquemático funciona sem provedor de tiles; mapas reais e busca dependem de serviços externos e ainda não estão configurados.

## Android

Aplicativo nativo em Kotlin/Compose; configure JDK 17 e Android SDK conforme `android/README.md`. Localização simulada do sistema só será habilitada via opção oficial de desenvolvedor. A saída debug esperada é `android/app/build/outputs/apk/debug/app-debug.apk`.

## Privacidade e limites

Dados locais ficam no dispositivo. Nenhuma telemetria externa está configurada. Simulação interna não muda localização sistêmica. Não há garantia de compatibilidade com aplicativos terceiros. Distâncias usam Haversine sobre esfera de raio 6.371.008,8 m, não distância rodoviária.
