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