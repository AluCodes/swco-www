# Deletes local branches that are both merged into origin/dev and deleted on GitHub.
# Run by post-checkout and post-merge. See agents/git-workflow.md.
#
# "Deleted on GitHub" is git's [gone] upstream status, which `git fetch` sets because
# `npm install` turns on fetch.prune. Never touches main, dev, the current branch, or a
# branch with commits that aren't in origin/dev. Doesn't contact GitHub itself.

git rev-parse --verify -q origin/dev >/dev/null || exit 0
current=$(git symbolic-ref --short -q HEAD || true)

git for-each-ref --format='%(refname:short) %(upstream:track)' refs/heads |
while read -r branch track; do
  [ "$track" = "[gone]" ] || continue
  case "$branch" in main|dev|"$current") continue ;; esac
  git merge-base --is-ancestor "$branch" origin/dev || continue
  sha=$(git rev-parse --short "$branch")
  git branch -D -q "$branch" &&
    printf '🧹 Deleted merged branch %s (was %s; restore: git branch %s %s)\n' "$branch" "$sha" "$branch" "$sha"
done

exit 0
