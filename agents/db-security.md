# Database security

Hard rules for any code that reads or writes the database. They apply to humans and AI
agents alike. A change that breaks one of them isn't ready to commit.

## 1. Only fixed, parameterised queries

- Every query is a fixed SQL string with placeholders (`?`, `$1`, …), and values are passed
  separately as bound parameters:
  ```ts
  db.prepare('SELECT … FROM posts WHERE slug = ?').bind(slug)
  ```
- Never build SQL from strings: no template literals, `+` or `.replace()` with request
  values. This applies to column names, `ORDER BY` and `LIMIT` too. Pick those from a
  fixed whitelist in code instead.
- Never add an endpoint that runs a query, filter or SQL fragment sent by the client.

## 2. Every admin route checks authentication first

- The first thing each admin handler does is check the admin session and return early if
  it's missing. It must come before reading the body, validating input or touching the DB.
- The only exceptions are the login routes (request a code, verify it, log out, read the
  session). None of them may read or write content tables. Don't add to this list without
  the user's explicit approval.

## 3. Public routes only read, and only published rows

- Public routes (everything outside the admin routes, plus server-side rendering code) only
  run `SELECT`s.
- They return only rows the public may see (for example, published posts, not drafts or
  scheduled posts whose date hasn't come yet).
- No writes on a public read path, not even housekeeping such as flipping due scheduled
  posts to published. Filter by date at read time instead.
- A public write (a newsletter sign-up, a contact form, analytics) is an exception that
  needs the user's explicit approval. List each approved one here, with its date. Each must
  validate and length-cap its input, cap the body size, be rate limited per client IP,
  reject requests from other sites (`Origin` / `Sec-Fetch-Site`), and write only to its
  own table.

## 4. Each database is reachable only from its own environment

- The production database is connected only to the production app, and the dev database
  only to the dev app. The local setup uses a local database and is never deployed.
- Never point the dev app at the production database, or the reverse.

## 5. AI agents confirm data changes and production actions first, in plain language

- Before changing database data in any environment (local, dev or prod), or running
  anything against production (including a production deploy), an AI agent posts a
  plain-language summary and waits for an explicit yes:

  > **Database:** prod
  > **What changes:** replaces the posts table with dev's rows
  > **Rows affected:** 10 posts added; 0 changed; 0 deleted
  > **Undo:** how to restore it, or "none needed"

  The user approves this summary, not a shell command. Don't ask them to read SQL, CLI
  flags or temp file paths.
- This covers SQL writes, imports, restores, and changes made through the admin UI or an
  API route.
- Prefer named, reviewed npm scripts with a dry-run mode over ad-hoc commands. Run the dry
  run first and build the summary from its output.
- Approval covers that one change only. A new or changed one needs a new yes.
- `.claude/settings.json` adds an `ask` rule, so Claude Code also prompts before any
  command that mentions prod.
