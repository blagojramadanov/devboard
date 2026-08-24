-- The initial migration (20260824142707) enabled RLS and added policies for
-- boards/tasks, but RLS policies only govern row access — Postgres still
-- requires a base table-level GRANT before a role can touch a table at all.
-- That grant was missing, so the anon/authenticated roles got
-- "permission denied for table boards/tasks" (42501) even though the
-- policies allow the rows. This migration adds the missing grants.

grant select, insert, update, delete on public.boards to anon, authenticated;
grant select, insert, update, delete on public.tasks to anon, authenticated;
