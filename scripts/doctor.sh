#!/usr/bin/env bash
set -uo pipefail

usage() { echo "Uso: scripts/doctor.sh [--sdk CAMINHO]"; }
sdk_arg=""
while (($#)); do
  case "$1" in
    --sdk) (($# >= 2)) || { usage >&2; exit 2; }; sdk_arg=$2; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) usage >&2; exit 2 ;;
  esac
done

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
cd "$ROOT" || exit 2
echo "Fake Loc doctor — raiz: $ROOT"

check_dns() {
  local host=$1
  if command -v getent >/dev/null 2>&1 && timeout 5 getent ahosts "$host" >/dev/null 2>&1; then
    echo "PASS DNS: $host"
  elif command -v python3 >/dev/null 2>&1 && timeout 5 python3 -c 'import socket,sys; socket.getaddrinfo(sys.argv[1],443)' "$host" >/dev/null 2>&1; then
    echo "PASS DNS: $host"
  else
    echo "BLOCK DNS: $host não resolveu nesta sessão"
  fi
}

echo
echo '[1/5] Rede e DNS'
for host in github.com api.github.com registry.npmjs.org vercel.com supabase.com; do check_dns "$host"; done
if command -v curl >/dev/null 2>&1; then
  for url in https://api.github.com/ https://registry.npmjs.org/ https://vercel.com/ https://cejivififvlhnwyeajwc.supabase.co/; do
    if curl --connect-timeout 3 --max-time 7 -sS -o /dev/null "$url" 2>/dev/null; then
      echo "PASS HTTPS: ${url%%/} (resposta recebida)"
    else
      echo "BLOCK HTTPS: ${url%%/} (rede/TLS/serviço; veja DNS acima)"
    fi
  done
else
  echo 'SKIP HTTPS: curl não instalado'
fi

echo
echo '[2/5] Autenticação GitHub e acesso ao repositório'
if command -v gh >/dev/null 2>&1; then
  if gh auth status >/dev/null 2>&1; then echo 'PASS GitHub CLI: sessão autenticada'; else echo 'BLOCK GitHub CLI: execute gh auth login --web no terminal normal'; fi
else
  echo 'BLOCK GitHub CLI: gh não instalado'
fi
remote=$(git remote get-url origin 2>/dev/null || true)
if [[ -z "$remote" ]]; then
  echo 'BLOCK Git: remoto origin não configurado'
elif command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1 && timeout 12 env GIT_TERMINAL_PROMPT=0 git -c credential.helper= -c 'credential.helper=!gh auth git-credential' -c 'url.https://github.com/.insteadOf=git@github.com:' -c 'url.https://github.com/.insteadOf=ssh://git@github.com/' ls-remote "$remote" HEAD >/dev/null 2>&1; then
  echo 'PASS Git remoto: leitura autorizada'
elif timeout 12 env GIT_TERMINAL_PROMPT=0 git ls-remote "$remote" HEAD >/dev/null 2>&1; then
  echo 'PASS Git remoto: leitura autorizada (SSH/credential helper existente)'
else
  echo 'BLOCK Git remoto: consulte DNS/HTTPS acima; com rede ativa, verifique permissão de leitura do repositório e chave SSH/credencial'
fi

echo
echo '[3/5] Permissão para abrir portas locais'
if command -v python3 >/dev/null 2>&1; then
  python3 - <<'PY'
import errno, socket
try:
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
    print("PASS bind loopback: porta efêmera disponível")
except OSError as exc:
    print(f"BLOCK bind loopback: errno={exc.errno} ({exc.strerror})")
try:
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 5173))
    print("PASS bind 127.0.0.1:5173: porta livre e permitida")
except OSError as exc:
    if exc.errno == errno.EADDRINUSE:
        print("BUSY 127.0.0.1:5173: porta já ocupada; Vite pode usar outra")
    elif exc.errno in (errno.EACCES, errno.EPERM):
        print(f"BLOCK 127.0.0.1:5173: permissão negada (errno={exc.errno})")
    else:
        print(f"BLOCK 127.0.0.1:5173: errno={exc.errno} ({exc.strerror})")
PY
else
  echo 'SKIP bind: Python 3 não instalado'
fi

echo
echo '[4/5] Node 22'
node22=""
for candidate in \
  "${NODE22:-}" \
  "$HOME"/.nvm/versions/node/v22*/bin/node \
  "$HOME"/.volta/tools/image/node/22*/bin/node \
  "$HOME"/.local/share/mise/installs/node/22*/bin/node \
  /usr/local/lib/nodejs/node-v22*/bin/node \
  /opt/node-v22*/bin/node; do
  [[ -x "$candidate" ]] || continue
  if [[ $("$candidate" --version 2>/dev/null) == v22.* ]]; then node22=$candidate; break; fi
done
if [[ -n "$node22" ]]; then echo "PASS Node 22: $node22 ($("$node22" --version))"; else
  current=$(node --version 2>/dev/null || echo ausente)
  echo "BLOCK Node 22: não localizado; ativo=$current. Defina NODE22 ou instale Node 22 no terminal normal."
fi

echo
echo '[5/5] JDK e Android SDK'
if command -v java >/dev/null 2>&1; then
  java_version=$(java -version 2>&1 | head -n 1)
  echo "INFO JDK: $java_version"
else
  echo 'BLOCK JDK: java não encontrado'
fi
sdk="${sdk_arg:-${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}}"
if [[ -z "$sdk" ]]; then
  for candidate in "$HOME/Android/Sdk" "$HOME/Android/sdk" /opt/android-sdk /usr/lib/android-sdk; do
    if [[ -d "$candidate" ]]; then sdk=$candidate; break; fi
  done
fi
if [[ -z "$sdk" || ! -d "$sdk" ]]; then
  echo 'BLOCK Android SDK: não localizado. Use --sdk CAMINHO ou configure ANDROID_HOME/ANDROID_SDK_ROOT na sessão.'
else
  echo 'INFO Android SDK: diretório localizado'
  [[ -x "$sdk/platform-tools/adb" ]] && echo 'PASS adb instalado' || echo 'BLOCK adb ausente (platform-tools)'
  if find "$sdk/platforms" -maxdepth 2 -name android.jar -type f -print -quit 2>/dev/null | grep -q .; then echo 'PASS plataforma Android instalada'; else echo 'BLOCK plataformas Android ausentes'; fi
  if find "$sdk/build-tools" -mindepth 1 -maxdepth 1 -type d -print -quit 2>/dev/null | grep -q .; then echo 'PASS Android build-tools instalados'; else echo 'BLOCK Android build-tools ausentes'; fi
  if [[ -x "$sdk/cmdline-tools/latest/bin/sdkmanager" || -x "$sdk/tools/bin/sdkmanager" ]]; then echo 'PASS sdkmanager instalado'; else echo 'INFO sdkmanager não encontrado no caminho padrão'; fi
fi

echo
echo 'Diagnóstico concluído. Nenhuma variável permanente foi alterada e nenhum pacote foi instalado.'
