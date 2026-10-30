# Arquitetura

O núcleo web `src/geo.ts` é puro e independente da interface. Coordenadas são objetos nomeados latitude/longitude WGS84 em graus decimais; distância Haversine usa esfera de raio 6.371.008,8 m. Interpolação segue arco curto inclusive no antimeridiano. Velocidade e distância internas são m/s e m.

A interface web atual é um fluxo local independente de backend. Favoritos ficam em localStorage com chave versionada. A aplicação Android começa em Compose e valida entrada, mas ainda não compartilha o motor, não persiste dados e não injeta localização.

O mapa web é esquemático e atribuído como ilustrativo; mapas tiles reais, roteamento e geocodificação foram deliberadamente deixados fora até selecionar provedor, política, atribuição e tratamento de CORS.
