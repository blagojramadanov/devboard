import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useBoards } from "@/context/BoardsContext"
import { BoardHeader } from "@/components/board-detail/BoardHeader"
import { BoardColumn } from "@/components/board-detail/BoardColumn"
import { Button } from "@/components/ui/button"

type LoadStatus = "loading" | "ready" | "not-found" | "error"

function NotFound() {
  return (
    <div className="flex flex-col items-center gap-3 py-24 text-center">
      <p className="text-sm font-medium text-muted-foreground">Board not found</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        It may have been deleted, or the link is incorrect.
      </p>
      <Button className="mt-2" nativeButton={false} render={<Link to="/" />}>
        Back to boards
      </Button>
    </div>
  )
}

export function BoardDetailPage() {
  const { boardId } = useParams()

  if (!boardId) return <NotFound />

  return <BoardDetailPageContent key={boardId} boardId={boardId} />
}

function BoardDetailPageContent({ boardId }: { boardId: string }) {
  const { boards, renameBoard, createTask, updateTask, deleteTask, moveTask, loadBoardDetail } =
    useBoards()
  const board = boards.find((item) => item.id === boardId)
  const [status, setStatus] = useState<LoadStatus>("loading")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    loadBoardDetail(boardId)
      .then((found) => {
        if (cancelled) return
        setStatus(found ? "ready" : "not-found")
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Failed to load board.")
        setStatus("error")
      })

    return () => {
      cancelled = true
    }
  }, [boardId, loadBoardDetail])

  if (status === "loading") {
    return <p className="py-24 text-center text-sm text-muted-foreground">Loading board...</p>
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <p className="text-sm font-medium text-destructive">Failed to load board</p>
        <p className="max-w-sm text-sm text-muted-foreground">{error}</p>
        <Button className="mt-2" nativeButton={false} render={<Link to="/" />}>
          Back to boards
        </Button>
      </div>
    )
  }

  if (!board) {
    return <NotFound />
  }

  return (
    <div>
      <BoardHeader board={board} onRename={(title) => renameBoard(board.id, title)} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {board.columns.map((column) => (
          <BoardColumn
            key={column.id}
            column={column}
            onCreateTask={(input) => createTask(board.id, column.id, input)}
            onUpdateTask={(taskId, input) => updateTask(board.id, taskId, input)}
            onDeleteTask={(taskId) => deleteTask(board.id, taskId)}
            onDropTask={(taskId, targetIndex) =>
              moveTask(board.id, taskId, column.id, targetIndex).catch((err) => {
                console.error("Failed to move task:", err)
              })
            }
          />
        ))}
      </div>
    </div>
  )
}
