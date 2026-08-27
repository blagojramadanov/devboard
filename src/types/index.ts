export type ColumnId = "todo" | "in-progress" | "done"

export interface Person {
  id: string
  name: string
  role: string
  initials: string
  color: string
}

export interface Task {
  id: string
  title: string
  description: string
  assigneeId: string | null
  dueDate: string | null
  createdAt: string
}

export interface Column {
  id: ColumnId
  title: string
  tasks: Task[]
}

export interface Board {
  id: string
  title: string
  createdAt: string
  columns: Column[]
  // Lightweight task totals for list views that haven't loaded this
  // board's real columns yet (see services/boards.ts getBoards()).
  // Undefined once the real columns are known — callers should fall
  // back to counting board.columns in that case.
  taskCounts?: { total: number; done: number }
}

export interface TaskInput {
  title: string
  description: string
  assigneeId: string | null
  dueDate: string | null
}
