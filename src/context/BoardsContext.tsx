import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import type { Board, ColumnId, Task, TaskInput } from "@/types"
import { createDefaultColumns } from "@/lib/columns"
import { getBoards } from "@/services/boards"

interface BoardsContextValue {
  boards: Board[]
  createBoard: (title: string) => Board
  deleteBoard: (boardId: string) => void
  renameBoard: (boardId: string, title: string) => void
  createTask: (boardId: string, columnId: ColumnId, input: TaskInput) => void
  updateTask: (boardId: string, taskId: string, input: TaskInput) => void
  deleteTask: (boardId: string, taskId: string) => void
  moveTask: (boardId: string, taskId: string, targetColumnId: ColumnId, targetIndex: number) => void
}

const BoardsContext = createContext<BoardsContextValue | null>(null)

export function BoardsProvider({ children }: { children: ReactNode }) {
  const [boards, setBoards] = useState<Board[]>([])

  useEffect(() => {
    let cancelled = false

    getBoards()
      .then((fetched) => {
        if (!cancelled) setBoards(fetched)
      })
      .catch((error) => {
        console.error("Failed to load boards from Supabase:", error)
      })

    return () => {
      cancelled = true
    }
  }, [])

  function createBoard(title: string): Board {
    const board: Board = {
      id: crypto.randomUUID(),
      title,
      createdAt: new Date().toISOString(),
      columns: createDefaultColumns(),
    }
    setBoards((prev) => [...prev, board])
    return board
  }

  function deleteBoard(boardId: string) {
    setBoards((prev) => prev.filter((board) => board.id !== boardId))
  }

  function renameBoard(boardId: string, title: string) {
    setBoards((prev) =>
      prev.map((board) => (board.id === boardId ? { ...board, title } : board)),
    )
  }

  function createTask(boardId: string, columnId: ColumnId, input: TaskInput) {
    const task: Task = {
      id: crypto.randomUUID(),
      title: input.title,
      description: input.description,
      assigneeId: input.assigneeId,
      dueDate: input.dueDate,
      createdAt: new Date().toISOString(),
    }
    setBoards((prev) =>
      prev.map((board) => {
        if (board.id !== boardId) return board
        return {
          ...board,
          columns: board.columns.map((column) =>
            column.id === columnId ? { ...column, tasks: [...column.tasks, task] } : column,
          ),
        }
      }),
    )
  }

  function updateTask(boardId: string, taskId: string, input: TaskInput) {
    setBoards((prev) =>
      prev.map((board) => {
        if (board.id !== boardId) return board
        return {
          ...board,
          columns: board.columns.map((column) => ({
            ...column,
            tasks: column.tasks.map((task) =>
              task.id === taskId
                ? {
                    ...task,
                    title: input.title,
                    description: input.description,
                    assigneeId: input.assigneeId,
                    dueDate: input.dueDate,
                  }
                : task,
            ),
          })),
        }
      }),
    )
  }

  function deleteTask(boardId: string, taskId: string) {
    setBoards((prev) =>
      prev.map((board) => {
        if (board.id !== boardId) return board
        return {
          ...board,
          columns: board.columns.map((column) => ({
            ...column,
            tasks: column.tasks.filter((task) => task.id !== taskId),
          })),
        }
      }),
    )
  }

  function moveTask(boardId: string, taskId: string, targetColumnId: ColumnId, targetIndex: number) {
    setBoards((prev) =>
      prev.map((board) => {
        if (board.id !== boardId) return board

        let movedTask: Task | undefined
        const columnsWithoutTask = board.columns.map((column) => {
          const found = column.tasks.find((task) => task.id === taskId)
          if (found) movedTask = found
          return { ...column, tasks: column.tasks.filter((task) => task.id !== taskId) }
        })

        if (!movedTask) return board

        return {
          ...board,
          columns: columnsWithoutTask.map((column) => {
            if (column.id !== targetColumnId) return column
            const tasks = [...column.tasks]
            const insertAt = Math.min(targetIndex, tasks.length)
            tasks.splice(insertAt, 0, movedTask as Task)
            return { ...column, tasks }
          }),
        }
      }),
    )
  }

  return (
    <BoardsContext.Provider
      value={{
        boards,
        createBoard,
        deleteBoard,
        renameBoard,
        createTask,
        updateTask,
        deleteTask,
        moveTask,
      }}
    >
      {children}
    </BoardsContext.Provider>
  )
}

export function useBoards() {
  const context = useContext(BoardsContext)
  if (!context) {
    throw new Error("useBoards must be used within a BoardsProvider")
  }
  return context
}
