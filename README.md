# DevBoard

A small Trello-style task board: create boards, add tasks to *To Do* / *In Progress* / *Done*, assign teammates, and drag tasks between columns.

Boards are read from a Supabase Postgres database; board/task creation and editing are still local-only (in-memory) while that migration is in progress. Teammates and theme preference are still stored in the browser's `localStorage`.

## STACK

React, React Router, TypeScript, Tailwind CSS, Base UI (via shadcn/ui components), Supabase.

## Setup

```
npm install
cp .env.example .env.local   # then fill in your Supabase project's URL and anon key
npm run dev
```

`src/types/supabase.ts` holds generated types for the Supabase database schema. Whenever the schema changes (new migration), regenerate it with:

```
npm run gen:types
```

This requires the Supabase CLI to be linked to the project (`supabase link`).