# Database schema

- `db/schema.sql` is the source of truth for every database's structure. Change it first,
  then apply the same change to each database.

## Separate databases

There's one database per environment: local (on this machine), dev and prod. They never
sync on their own. When adding or changing data, say which database it goes to, and ask if
the user hasn't made that clear.

## Copying data between databases

- Copy data with a script that does a dry run by default (prints row counts, changes
  nothing) and only writes when told to (e.g. `--yes`).
- Never copy tables holding secrets or real people's data (login codes, subscribers'
  emails) into a less protected environment.
- Before writing to dev or prod, make sure there's a way back (a backup or restore point)
  and include it in the confirmation (see `agents/db-security.md`, rule 5).

## Schema check

Before each deploy, compare the live database with `db/schema.sql` and stop the deploy if
they differ. Only structural differences count, not comments or whitespace.

## Fixing a mismatch

- **You changed `db/schema.sql`:** apply the same change to each database. If the table has
  data, use an `ALTER TABLE` or a migration. Only drop and recreate empty tables.
- **Someone changed the DB directly:** either add that change to `db/schema.sql`, or revert
  the DB.
