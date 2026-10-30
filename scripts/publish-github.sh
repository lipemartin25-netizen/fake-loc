#!/usr/bin/env bash
set -Eeuo pipefail

usage() { echo "Uso: scripts/publish-github.sh [--dry-run]"; }
dry_run=false
while (($#)); do
  case "$1" in
    --dry-run) dry_run=true; shift ;;
    -h|--help) usage; exit 0 ;;
    *) usage >&2; exit 2 ;;
  esac
done

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
cd "$ROOT"
BRANCH=codex/fake-loc-rebuild
EXPECTED_REPO=lipemartin25-netizen/fake-loc
gh_git() {
  GIT_TERMINAL_PROMPT=0 git \
    -c credential.helper= \
    -c 'credential.helper=!gh auth git-credential' \
    -c 'url.https://github.com/.insteadOf=git@github.com:' \
    -c 'url.https://github.com/.insteadOf=ssh://git@github.com/' \
    "$@"
}

if [[ $(git rev-parse --show-toplevel) != "$ROOT" ]]; then echo 'Erro: raiz Git inesperada.' >&2; exit 2; fi
if [[ $(git branch --show-current) != "$BRANCH" ]]; then echo "Erro: faça checkout de $BRANCH sem descartar alterações." >&2; exit 2; fi
remote=$(git remote get-url origin)
case "$remote" in
  "git@github.com:$EXPECTED_REPO.git"|"https://github.com/$EXPECTED_REPO.git"|"ssh://git@github.com/$EXPECTED_REPO.git") ;;
  *) echo 'Erro: origin não corresponde ao repositório Fake Loc esperado.' >&2; exit 2 ;;
esac

# Explicit allowlist: no glob, git add ., or automatic inclusion of user files.
approved=(
  README.md docs/ACCEPTANCE.md docs/ARCHITECTURE.md docs/DEPLOY.md docs/PRIVACY.md
  docs/STATE.md docs/TEST-REPORT.md docs/SUPABASE_SETUP.md
  supabase/schema.sql supabase/remove_legacy_hooks.sql supabase/restrict_rls_event_trigger_execution.sql
  web/src/ui/App.tsx web/src/cloud.ts web/src/cloud.test.ts web/src/vite-env.d.ts web/.env.example
  scripts/doctor.sh scripts/publish-github.sh
)

if ! git check-ignore -q web/.env.local; then echo 'Erro: web/.env.local não está ignorado pelo Git.' >&2; exit 3; fi
if git check-ignore -q web/.env.example; then echo 'Erro: web/.env.example foi excluído por uma regra ignore.' >&2; exit 3; fi
[[ -s web/.env.example ]] || { echo 'Erro: web/.env.example está ausente ou vazio.' >&2; exit 3; }

changed=()
for file in "${approved[@]}"; do
  if ! git ls-files --error-unmatch -- "$file" >/dev/null 2>&1 || ! git diff --quiet -- "$file" || ! git diff --cached --quiet -- "$file"; then
    if [[ -e "$file" || -L "$file" ]]; then changed+=("$file"); else echo "Erro: caminho aprovado ausente: $file" >&2; exit 3; fi
  fi
done
if ((${#changed[@]} == 0)); then echo 'Não há alterações aprovadas para publicar.'; exit 0; fi

echo 'Arquivos aprovados para publicação:'
printf '  %s\n' "${changed[@]}"
echo 'Outras alterações do checkout serão preservadas e não serão incluídas.'
git diff --stat HEAD -- "${changed[@]}"

# Report filenames only; never print a possible credential value.
if ! python3 - "${changed[@]}" <<'PY'
import pathlib, re, sys
patterns = [
    re.compile(rb"sb_secret_[A-Za-z0-9_-]{20,}"),
    re.compile(rb"gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}"),
    re.compile(rb"AKIA[0-9A-Z]{16}"),
    re.compile(rb"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
    re.compile(rb'"role"\s*:\s*"service_role"'),
]
bad=[]
for name in sys.argv[1:]:
    path=pathlib.Path(name)
    if not path.is_file():
        continue
    data=path.read_bytes()
    if any(p.search(data) for p in patterns):
        bad.append(name)
if bad:
    print("Possible secret detected in approved file(s): " + ", ".join(bad), file=sys.stderr)
    sys.exit(1)
PY
then
  echo 'Publicação interrompida pelo scanner de segredos.' >&2
  exit 4
fi

if ! command -v gh >/dev/null 2>&1 || ! gh auth status >/dev/null 2>&1; then
  echo 'GitHub CLI não autenticado. Execute gh auth login --web no terminal normal.' >&2
  exit 5
fi

if $dry_run; then
  echo 'DRY-RUN: nenhum arquivo foi staged, nenhum commit/push/PR foi criado.'
  echo "Branch alvo: $BRANCH. Arquivos aprovados: ${#changed[@]}."
  exit 0
fi

remote_hash=""
if remote_line=$(timeout 15 gh_git ls-remote --heads origin "$BRANCH" 2>/dev/null); then
  remote_hash=${remote_line%%$'\t'*}
  if [[ -n "$remote_hash" ]] && ! git merge-base --is-ancestor "$remote_hash" HEAD; then
    echo 'Branch local e remota divergiram ou remoto está adiante; nada será sobrescrito.' >&2
    echo 'Integre a branch remota com merge/rebase revisado e rode novamente.' >&2
    exit 7
  fi
else
  echo 'Aviso: origin não pôde ser consultado; será feito apenas o commit local, sem tentativa cega de push.' >&2
fi

git add -- "${changed[@]}"
echo 'Revisão do diff staged:'
git diff --cached --check
git diff --cached --stat -- "${changed[@]}"
if ! git diff --cached --quiet -- "${changed[@]}"; then
  git commit --only -m "Configure Fake Loc Supabase integration" -- "${changed[@]}"
fi

if ! remote_line=$(timeout 15 gh_git ls-remote --heads origin "$BRANCH" 2>/dev/null); then
  echo 'Commit local preservado; push bloqueado porque origin segue inacessível. Execute scripts/doctor.sh no terminal normal.' >&2
  exit 6
fi
remote_hash=${remote_line%%$'\t'*}
if [[ -n "$remote_hash" ]] && ! git merge-base --is-ancestor "$remote_hash" HEAD; then
  echo 'O remoto avançou durante a preparação; commit local preservado, push cancelado.' >&2
  exit 8
fi
gh_git push -u origin "$BRANCH"

local_hash=$(git rev-parse HEAD)
verify_line=$(timeout 15 gh_git ls-remote --heads origin "$BRANCH") || { echo 'Push enviado, mas a verificação remota falhou.' >&2; exit 9; }
verify_hash=${verify_line%%$'\t'*}
[[ "$verify_hash" == "$local_hash" ]] || { echo 'Hash remoto não corresponde ao commit local.' >&2; exit 9; }
echo "Push verificado: $BRANCH $local_hash"

base=$(gh repo view "$EXPECTED_REPO" --json defaultBranchRef --jq '.defaultBranchRef.name')
[[ -n "$base" && "$base" != "$BRANCH" ]] || { echo 'Não foi possível determinar a branch base do PR.' >&2; exit 10; }
pr_url=$(gh pr list --repo "$EXPECTED_REPO" --head "$BRANCH" --json url --jq '.[0].url // ""')
if [[ -z "$pr_url" ]]; then
  body_file=$(mktemp)
  trap 'rm -f "$body_file"' EXIT
  cat > "$body_file" <<'EOF'
## Fake Loc web/Supabase integration

- Adds optional email authentication and explicit favorite synchronization using the publishable key and row-level security.
- Replaces legacy public app tables with Fake Loc favorites, routes, and movement profiles.
- Adds diagnostics and a guarded GitHub publishing helper.
- Preserves local browser mode; Android and real Auth/Data API validation remain separate.

No automatic merge. Review the Supabase scope and deployment environment before merging.
EOF
  pr_url=$(gh pr create --repo "$EXPECTED_REPO" --base "$base" --head "$BRANCH" --title 'Configure Fake Loc Supabase integration' --body-file "$body_file")
fi
echo "PR: $pr_url"
