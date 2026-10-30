# Cloudflare environments

Every Cloudflare Worker project has three environments, named after the project
(`<project>` is the repo name, e.g. `pixel-www`):

| Environment | Worker name | Where it's defined | Deployed from |
|---|---|---|---|
| local | `<project>-local` | top level of `wrangler.jsonc` | never deployed; local runs only |
| dev | `<project>-dev` | `env.dev` | `origin/dev` |
| production | `<project>` | `env.production` | `origin/main` |

## Rules

1. **The top level of `wrangler.jsonc` is local only.** It's what `wrangler dev` uses, and
   it's never deployed.
2. **Every deploy names its environment:** `wrangler deploy --env dev` or
   `wrangler deploy --env production`, through the `deploy` and `deploy:production` npm
   scripts. Never run a bare `wrangler deploy`.
3. **Other Cloudflare resources follow the same names**, e.g. D1 databases, KV namespaces
   and R2 buckets: `<project>-local`, `<project>-dev`, `<project>`. Each environment only
   binds its own (see `agents/db-security.md`, rule 4).
4. **Repeat `vars` in every env.** Wrangler doesn't inherit them from the top level.
5. **Production deploys need the user's yes first** (see `agents/db-security.md`, rule 5).
