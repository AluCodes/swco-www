# Git & deployment workflow

The rule book for how changes move from a branch to production. It applies to humans and
AI agents alike.

## The flow

```
origin/dev ──► feat/<name> ──PR──► dev ──deploy──► test environment
                                    │
                                    └──PR──► main ──deploy──► production
```

## Rules

1. **`main` is only updated by a PR from `dev`.** No direct commits or pushes, and no PRs
   into `main` from any other branch.
2. **Every feature or fix starts on a new branch from `origin/dev`:**
   ```bash
   git fetch origin
   git switch -c feat/<short-name> origin/dev
   ```
   Name it `<type>/<short-name>` (see [Branch names](#branch-names)).
3. **One branch = one item.** A branch adds one feature or fixes one bug. If you notice
   something unrelated, open a separate branch for it.
4. **At most 10 changed files per branch**, counted against `origin/dev`. Going over the
   limit usually means the branch is doing more than one thing, so split it.
5. **`dev` is only updated by PRs from feature branches.** No direct commits or pushes.
6. **Test and verify before every commit.** Don't commit a change you haven't seen working.
   See [Verify before committing](#verify-before-committing).

## Branch names

Format: `<type>/<short-name>`

| Type | Use it for | Example |
|---|---|---|
| `feat` | a new feature or user-visible addition | `feat/admin-post-search` |
| `fix` | a bug fix, including urgent ones | `fix/admin-login-redirect` |
| `refactor` | restructuring code without changing behavior | `refactor/admin-api-client` |
| `docs` | documentation only | `docs/deploy-guide` |
| `chore` | tooling, config, dependencies, CI | `chore/upgrade-deps` |

- The short name is lowercase words joined by hyphens: no spaces, underscores or dots.
- Keep it to 2–4 words that describe the one item the branch covers.
- There's no `hotfix` type. Urgent fixes are `fix/` branches and follow the same
  `dev` → `main` flow.
- Schema changes use whichever type fits (usually `feat` or `fix`).

## Verify before committing

Run these before each commit. The pre-commit hook only runs step 1 automatically.

1. **Type check:** `npm run typecheck`. Runs automatically on every commit and blocks it
   on errors.
2. **Build:** `npm run build` must succeed for any change to code or config.
3. **Check the change itself** in the running app (`npm run dev`):
   - **UI:** open the affected pages and check that they look and behave right.
   - **API route:** call the endpoint and check the response.
   - **Bug fix:** reproduce the bug first, then confirm it's gone.
4. **Change-specific checks:** for a schema change, run the schema check (see
   `agents/db-schema.md`).
5. **Review the diff:** `git diff --staged`. Only changes for this branch's one item, no
   debug code, no secrets.

In the PR description, say what you verified and how. If something couldn't be verified
(for example, it needs production data), say so explicitly rather than implying it was
tested.

**AI agents** must actually run these steps and report the real output, not assume they
pass. A failing check means the change isn't ready to commit.

**AI agents push after testing:** once every step above has really passed, commit and push
the branch (`git push -u origin <branch>`) without waiting to be asked. If a step couldn't
be checked, don't push; say what's still unverified. Don't open the PR: the user opens PRs
themselves.

## Step by step

1. **Branch:** `git fetch origin && git switch -c fix/<name> origin/dev`
2. **Work, verify, commit** on that branch. Run through
   [Verify before committing](#verify-before-committing) first. The pre-commit hook checks
   the branch name, the 10-file limit and the type check.
3. **Push:** `git push -u origin fix/<name>`, then open a PR into **`dev`**.
4. **Merge** the PR once the `pr-rules` check passes and the base is `dev`, then delete the
   branch.
5. **Deploy dev and test:** deploy `origin/dev` to the test environment and check the change
   there.
6. **Release:** open a PR from **`dev` into `main`**, and merge it once it passes.
7. **Deploy production:** deploy `origin/main`. This is a production action, so an AI agent
   asks first (see `agents/db-security.md`, rule 5).

Deploy only what's merged on GitHub, never uncommitted or unmerged local files. Local
settings (`.env` and similar) never reach a live site; each environment gets its own
secrets.

## How the rules are enforced

| Layer | Where | What it checks | Can it be bypassed? |
|---|---|---|---|
| Husky `pre-commit` | `.husky/pre-commit` | not committing on `main`/`dev`; branch name; ≤10 files incl. staged; type check | yes, `--no-verify` |
| Husky `pre-push` | `.husky/pre-push` | not pushing to `main`/`dev`; ≤10 files | yes, `--no-verify` |
| Husky `post-checkout`, `post-merge` | `.husky/delete-merged-branches.sh` | not a check: after a branch switch or `git pull`, deletes local branches that are merged into `origin/dev` and deleted on GitHub | `HUSKY=0` |
| GitHub Action | `.github/workflows/pr-rules.yml` | PR into `main` comes from `dev`; PR into `dev` is named correctly and ≤10 files | only if it isn't a required check, see below |

The hooks install automatically on `npm install` (via the `prepare` script). `prepare` also
turns on `fetch.prune`, so `git fetch` notices branches deleted on GitHub; the cleanup
prints each branch it deletes, with the command to restore it. The shared
logic is in `.husky/branch-rules.sh`.

"One item per branch" (rule 3) can't be checked by a machine. Reviewers and agents have to
enforce it.

### Making GitHub block bad merges

GitHub only enforces branch rulesets on public repos and paid plans (e.g. GitHub Team). On
a private repo on a free account, **nothing on GitHub blocks a merge**: `pr-rules` is
advisory, so a red ✗ means **don't merge it**. Before clicking **Merge**, check that the
base branch is right (`dev` for feature branches, `main` only from `dev`) and that
`pr-rules` is green.

Where rulesets are available, set them up under **Settings → Rules → Rulesets → New branch
ruleset**, once for `main` and once for `dev`:

- **Target:** the branch (`main` or `dev`)
- Turn on **Restrict deletions** and **Block force pushes**
- Turn on **Require a pull request before merging**
- Turn on **Require status checks to pass**, and add `pr-rules`
- Leave **Bypass list** empty, unless you want admins to be able to push in an emergency

AI agents must never bypass the hooks (`--no-verify`) or merge a PR with a failing `pr-rules`
check unless the user explicitly asks for that specific action.
