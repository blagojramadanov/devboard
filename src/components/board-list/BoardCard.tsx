import { useState } from "react"
import { Link } from "react-router-dom"
import { Trash2 } from "lucide-react"
import type { Board } from "@/types"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"

interface BoardCardProps {
  board: Board
  onDelete: (boardId: string) => void
}

export function BoardCard({ board, onDelete }: BoardCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  const totalTasks = board.columns.reduce((sum, column) => sum + column.tasks.length, 0)
  const doneTasks = board.columns.find((column) => column.id === "done")?.tasks.length ?? 0

  return (
    <div className="group relative rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md">
      <Link to={`/boards/${board.id}`} className="absolute inset-0 rounded-xl" aria-label={board.title} />

      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium leading-tight">{board.title}</h3>
        <Button
          variant="ghost"
          size="icon-sm"
          className="relative z-10 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={() => setConfirmOpen(true)}
        >
          <Trash2 className="size-4" />
          <span className="sr-only">Delete board</span>
        </Button>
      </div>

      <p className="mt-3 text-sm text-muted-foreground">
        {totalTasks === 0 ? "No tasks yet" : `${doneTasks} of ${totalTasks} tasks done`}
      </p>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete board"
        description={`Delete "${board.title}"? This removes all of its tasks and cannot be undone.`}
        onConfirm={() => onDelete(board.id)}
      />
    </div>
  )
}
