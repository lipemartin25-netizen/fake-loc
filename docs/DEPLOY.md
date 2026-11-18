# Deploy da web na Vercel

O aplicativo web é estático e não precisa de Supabase para uso básico. A configuração está em `web/vercel.json`. No painel da Vercel, importe `lipemartin25-netizen/fake-loc` depois que a branch desta reconstrução estiver publicada e selecione:

- Framework: Vite
- Root Directory: `web`
- Install Command: `npm ci`
- Build Command: `npm run build`
- Output Directory: `dist`

## Projeto Vercel selecionado

O projeto indicado pelo proprietário é [all-smal-things](https://vercel.com/felipe-martins-projects-64e8eb2d/all-smal-things), no scope `felipe-martins-projects-64e8eb2d`. Para ligar o checkout a esse projeto após autenticar o CLI, execute na pasta `web/`: `vercel link --project all-smal-things`, confirme o scope e configure Root Directory `web` nas Project Settings. O diretório local `.vercel/` é ignorado pelo Git.

No dashboard ou CLI, adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` para Production (e Preview se quiser validar previews). A CLI interativa aceita `vercel env add VITE_SUPABASE_URL production` e `vercel env add VITE_SUPABASE_PUBLISHABLE_KEY production`; não use chave secret/service-role. Faça deploy com `vercel --prod` depois do link, ambiente e branch estarem corretos. A branch `codex/fake-loc-rebuild` ainda precisa de push confirmado antes de usar a integração Git.

O runtime Node está fixado a `22.x` em `web/package.json`, compatível com as versões de jsdom e undici travadas no lockfile e disponível na Vercel. A regra SPA encaminha caminhos não reconhecidos ao documento inicial; arquivos estáticos continuam servidos como assets.

Referências oficiais: [configuração `vercel.json`](https://vercel.com/docs/project-configuration/vercel-json), [Vite na Vercel](https://vercel.com/docs/frameworks/frontend/vite), [versões Node suportadas](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).

## Estado deste ambiente

Nenhum deploy foi executado nem URL pública foi verificada. `gh auth status` passou, mas esta sessão não resolve GitHub/npm/Vercel por DNS e o bind local está bloqueado; `vercel` CLI não está instalado. Use `scripts/doctor.sh` no terminal normal para separar esses estados. Não cole tokens no chat.

Configuração Vercel esperada: Root Directory `web`; Framework `Vite`; Install `npm ci`; Build `npm run build`; Output `dist`. `web/vercel.json` fixa build e saída; Root Directory continua sendo configuração do projeto Vercel. Cadastre `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` em Environment Variables para Production e Preview, sem incluir uma chave secret/service-role, e faça redeploy. Nenhuma variável foi enviada à Vercel nesta sessão.

URLs de Auth Supabase: durante desenvolvimento local, Site URL `http://localhost:5173` e Redirect URL permitida `http://localhost:5173/**`. Após confirmar o domínio Vercel, defina o Site URL para `https://<dominio-vercel-confirmado>` e permita `https://<dominio-vercel-confirmado>/**`; mantenha o endereço local permitido apenas para desenvolvimento. O domínio de produção ainda não existe/foi verificado, então o placeholder não deve ser cadastrado literalmente. As configurações de Auth não foram alteradas nesta sessão.

Favoritos podem ficar locais ao navegador e à origem do site. A sincronização Supabase opcional exige `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` no ambiente de build/deploy; sem elas, o modo local permanece. Ver `SUPABASE_SETUP.md` para escopo e limitações.
