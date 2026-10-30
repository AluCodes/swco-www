# Shared by pre-commit and pre-push. See agents/git-workflow.md.

MAX_FILES=10
BRANCH_PATTERN='^(feat|fix|refactor|docs|chore)/[a-z0-9]+(-[a-z0-9]+)*$'

fail() {
  printf '\n\033[41;97m ✘ %s \033[0m\n' "$1" >&2
  shift
  for line in "$@"; do printf '  %s\n' "$line" >&2; done
  printf '  See agents/git-workflow.md\n\n' >&2
  exit 1
}

check_branch_name() {
  case "$1" in
    main|dev) fail "Don't commit directly to '$1'." \
      "Create a branch from origin/dev:  git fetch && git switch -c feat/<name> origin/dev" ;;
  esac
  echo "$1" | grep -Eq "$BRANCH_PATTERN" || fail "Branch '$1' doesn't follow the naming rule." \
    "Use <type>/<short-name>: type is feat, fix, refactor, docs or chore;" \
    "the name is lowercase words joined by hyphens, e.g. fix/admin-login-redirect." \
    "Rename it:  git branch -m <new-name>"
}

# $1: "--cached" to include staged changes (pre-commit), "HEAD" for commits only (pre-push)
check_file_count() {
  base=$(git merge-base HEAD origin/dev 2>/dev/null) || {
    printf '\033[33m⚠ origin/dev not found locally, skipping the %s-file check (run git fetch).\033[0m\n' "$MAX_FILES" >&2
    return 0
  }
  count=$(git diff $1 --name-only "$base" | wc -l | tr -d ' ')
  [ "$count" -le "$MAX_FILES" ] || fail "This branch changes $count files (limit: $MAX_FILES)." \
    "Each branch should cover one feature or fix. Split the work into smaller branches."
}
