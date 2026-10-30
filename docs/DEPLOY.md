# Deploy da web na Vercel

O aplicativo web é estático e não precisa de Supabase para uso básico. A configuração está em `web/vercel.json`. No painel da Vercel, importe `lipemartin25-netizen/fake-loc` depois que a branch desta reconstrução estiver publicada e selecione:

- Framework: Vite
- Root Directory: `web`
- Install Command: `npm ci`
- Build Command: `npm run build`
- Output Directory: `dist`

O runtime Node está fixado a `20.x` em `web/package.json`. A regra SPA encaminha caminhos não reconhecidos ao documento inicial; arquivos estáticos continuam servidos como assets.

## Estado deste ambiente

Nenhum deploy foi executado nem URL pública foi verificada. O token GitHub local falha em `gh auth status`; a rede não resolve `github.com`. Não há Vercel CLI nem integração Vercel conectada. O próximo passo de autenticação GitHub é executar `gh auth login --web` no terminal normal do usuário e concluir o fluxo oficial no navegador. Depois será necessário permitir conectividade à rede para confirmar o remoto, enviar a branch e ligar o projeto na Vercel. Não cole tokens no chat.

Favoritos são locais ao navegador e à origem do site. Publicar não transfere dados entre localhost e a URL pública. Supabase não foi configurado nem é necessário para o modo local.
