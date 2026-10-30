# Agent & git rules export

Copy everything in this folder (including the hidden `.husky`, `.github` and `.claude`
folders) into the root of the new project.

## What's here

| Path | What it does |
|---|---|
| `CLAUDE.md` | Tells Claude to read `agents/`, plus general coding guidelines |
| `agents/git-workflow.md` | dev → main flow, branch names, 10-file limit, verify before commit, push after testing |
| `agents/db-security.md` | Query safety, admin auth, public read-only, confirm DB/prod changes in plain language |
| `agents/db-schema.md` | Schema file as source of truth, one DB per environment, safe data copies |
| `.husky/` | Git hooks that block commits/pushes to main/dev, bad branch names, >10 files, type errors |
| `.github/workflows/pr-rules.yml` | Same checks on every GitHub PR |
| `.claude/settings.json` | Claude Code asks before any command containing "prod" |

## Setup in the new project

1. Install husky: `npm install --save-dev husky`
2. Add to `package.json` scripts:
   ```json
   "prepare": "husky && (git config fetch.prune true || true)",
   "typecheck": "tsc --noEmit"
   ```
   The pre-commit hook runs `npm run typecheck`. If the project has no type check, remove
   those lines from `.husky/pre-commit`.
3. Run `npm install` so the hooks get installed.
4. Create a `dev` branch and push it: `git switch -c dev && git push -u origin dev`.
5. On GitHub, make `pr-rules` a required check (see "Making GitHub block bad merges" in
   `agents/git-workflow.md`).
6. If the project has no database, delete `agents/db-*.md`. Otherwise, read them and fill in
   any project-specific details (table names, approved public writes, deploy commands).
