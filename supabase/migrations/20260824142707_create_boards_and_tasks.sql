-- DevBoard: boards & tasks schema
--
-- Source of truth: src/types/index.ts (Board, Column, Task) and
-- src/context/BoardsContext.tsx (columns are a fixed, static set of three
-- statuses per board — "todo" / "in-progress" / "done" — not a user-defined
-- entity, so there is no separate "columns" table. A task's column is
-- represented by its `status`, and its position within that column by
-- `position`, matching how BoardsContext.moveTask reorders tasks today).
--
-- Safe to run on a fresh database: every object creation is guarded so the
-- migration is idempotent/re-runnable.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------

create extension if not exists "pgcrypto" with schema public;

-- ---------------------------------------------------------------------------
-- Enum: task_status (mirrors ColumnId in src/types/index.ts)
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_type where typname = 'task_status') then
    create type public.task_status as enum ('todo', 'in-progress', 'done');
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- Shared trigger: keep updated_at current on every row update
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Table: boards
-- ---------------------------------------------------------------------------

create table if not exists public.boards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint boards_title_not_blank check (char_length(btrim(title)) > 0)
);

comment on table public.boards is 'A DevBoard board (src/types/index.ts: Board).';

drop trigger if exists set_boards_updated_at on public.boards;
create trigger set_boards_updated_at
  before update on public.boards
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Table: tasks
-- ---------------------------------------------------------------------------

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards (id) on delete cascade,
  title text not null,
  description text not null default '',
  assignee_id uuid,
  due_date date,
  status public.task_status not null default 'todo',
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tasks_title_not_blank check (char_length(btrim(title)) > 0),
  constraint tasks_position_not_negative check (position >= 0)
);

comment on table public.tasks is 'A DevBoard task (src/types/index.ts: Task), scoped to a board and column.';
comment on column public.tasks.status is 'Which column the task is in; mirrors ColumnId ("todo" | "in-progress" | "done").';
comment on column public.tasks.position is 'Sort order of the task within its (board_id, status) column.';
comment on column public.tasks.assignee_id is 'References a Person.id (src/types/index.ts). No FK yet: people/profiles are not persisted in Supabase as of this migration.';

drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at
  before update on public.tasks
  for each row
  execute function public.set_updated_at();

-- Lookups this app performs: "all tasks for a board" and
-- "all tasks for a board's column, in order" (BoardsContext render + moveTask).
-- The composite index also serves board_id-only lookups (leftmost prefix),
-- so a separate single-column index would be redundant.
create index if not exists tasks_board_id_status_position_idx
  on public.tasks (board_id, status, position);

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- The application has no auth/user model yet (no Supabase auth wiring, no
-- owner column on boards) — see project memory. RLS is enabled per Supabase
-- best practice (tables are otherwise flagged as publicly exposed), with
-- permissive "allow all" policies as an explicit placeholder until auth is
-- introduced and ownership-scoped policies can replace these.
-- ---------------------------------------------------------------------------

alter table public.boards enable row level security;
alter table public.tasks enable row level security;

drop policy if exists "boards_allow_all" on public.boards;
create policy "boards_allow_all"
  on public.boards
  for all
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "tasks_allow_all" on public.tasks;
create policy "tasks_allow_all"
  on public.tasks
  for all
  to anon, authenticated
  using (true)
  with check (true);
