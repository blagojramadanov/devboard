import { supabase } from "@/lib/supabase"
import { createDefaultColumns } from "@/lib/columns"
import type { Board, ColumnId, Task, TaskInput } from "@/types"

interface BoardRow {
  id: string
  title: string
  created_at: string
}

interface TaskRow {
  id: string
  title: string
  description: string
  assignee_id: string | null
  due_date: string | null
  status: ColumnId
  created_at: string
}

function toBoard(row: BoardRow): Board {
  return {
    id: row.id,
    title: row.title,
    createdAt: row.created_at,
    columns: createDefaultColumns(),
  }
}

function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    assigneeId: row.assignee_id,
    dueDate: row.due_date,
    createdAt: row.created_at,
  }
}

export async function getBoards(): Promise<Board[]> {
  const { data, error } = await supabase
    .from("boards")
    .select("id, title, created_at")
    .order("created_at", { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch boards: ${error.message}`)
  }

  const boards = (data ?? []).map(toBoard)

  // One lightweight query for every board's task counts, instead of
  // fetching full task rows per board (or per-board count queries).
  const { data: taskRows, error: countsError } = await supabase
    .from("tasks")
    .select("board_id, status")

  if (countsError) {
    throw new Error(`Failed to fetch task counts: ${countsError.message}`)
  }

  const counts = new Map<string, { total: number; done: number }>()
  for (const row of taskRows ?? []) {
    const entry = counts.get(row.board_id) ?? { total: 0, done: 0 }
    entry.total += 1
    if (row.status === "done") entry.done += 1
    counts.set(row.board_id, entry)
  }

  for (const board of boards) {
    board.taskCounts = counts.get(board.id) ?? { total: 0, done: 0 }
  }

  return boards
}

export async function createBoard(title: string): Promise<Board> {
  const { data, error } = await supabase
    .from("boards")
    .insert({ title })
    .select("id, title, created_at")
    .single()

  if (error) {
    throw new Error(`Failed to create board: ${error.message}`)
  }

  return toBoard(data)
}

export async function deleteBoard(boardId: string): Promise<void> {
  const { error } = await supabase.from("boards").delete().eq("id", boardId)

  if (error) {
    throw new Error(`Failed to delete board: ${error.message}`)
  }
}

export async function updateBoardTitle(boardId: string, title: string): Promise<void> {
  const { error } = await supabase.from("boards").update({ title }).eq("id", boardId)

  if (error) {
    throw new Error(`Failed to update board: ${error.message}`)
  }
}

export async function getBoardById(boardId: string): Promise<Board | null> {
  const { data: boardRow, error: boardError } = await supabase
    .from("boards")
    .select("id, title, created_at")
    .eq("id", boardId)
    .maybeSingle()

  if (boardError) {
    throw new Error(`Failed to fetch board: ${boardError.message}`)
  }

  if (!boardRow) return null

  const { data: taskRows, error: tasksError } = await supabase
    .from("tasks")
    .select("id, title, description, assignee_id, due_date, status, created_at")
    .eq("board_id", boardId)
    .order("status", { ascending: true })
    .order("position", { ascending: true })

  if (tasksError) {
    throw new Error(`Failed to fetch tasks: ${tasksError.message}`)
  }

  const columns = createDefaultColumns()
  for (const row of taskRows ?? []) {
    const column = columns.find((item) => item.id === row.status)
    if (column) column.tasks.push(toTask(row))
  }

  return {
    id: boardRow.id,
    title: boardRow.title,
    createdAt: boardRow.created_at,
    columns,
  }
}

export async function createTask(
  boardId: string,
  columnId: ColumnId,
  input: TaskInput,
): Promise<Task> {
  const { count, error: countError } = await supabase
    .from("tasks")
    .select("id", { count: "exact", head: true })
    .eq("board_id", boardId)
    .eq("status", columnId)

  if (countError) {
    throw new Error(`Failed to create task: ${countError.message}`)
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      board_id: boardId,
      title: input.title,
      description: input.description,
      assignee_id: input.assigneeId,
      due_date: input.dueDate,
      status: columnId,
      position: count ?? 0,
    })
    .select("id, title, description, assignee_id, due_date, status, created_at")
    .single()

  if (error) {
    throw new Error(`Failed to create task: ${error.message}`)
  }

  return toTask(data)
}

export async function updateTask(taskId: string, input: TaskInput): Promise<Task> {
  const { data, error } = await supabase
    .from("tasks")
    .update({
      title: input.title,
      description: input.description,
      assignee_id: input.assigneeId,
      due_date: input.dueDate,
    })
    .eq("id", taskId)
    .select("id, title, description, assignee_id, due_date, status, created_at")
    .single()

  if (error) {
    throw new Error(`Failed to update task: ${error.message}`)
  }

  return toTask(data)
}

export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await supabase.from("tasks").delete().eq("id", taskId)

  if (error) {
    throw new Error(`Failed to delete task: ${error.message}`)
  }
}

interface TaskPositionUpdate {
  id: string
  status: ColumnId
  position: number
}

export async function moveTask(updates: TaskPositionUpdate[]): Promise<void> {
  const results = await Promise.all(
    updates.map(({ id, status, position }) =>
      supabase.from("tasks").update({ status, position }).eq("id", id),
    ),
  )

  const failed = results.find((result) => result.error)
  if (failed?.error) {
    throw new Error(`Failed to move task: ${failed.error.message}`)
  }
}
