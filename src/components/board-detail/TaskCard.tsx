import { useState } from "react"
import type { DragEvent } from "react"
import { CalendarDays, Trash2 } from "lucide-react"
import type { Task } from "@/types"
import { usePeople } from "@/context/PeopleContext"
import { Button } from "@/components/ui/button"
import { PersonAvatar } from "@/components/shared/PersonAvatar"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { cn } from "@/lib/utils"

interface TaskCardProps {
  task: Task
  isDone?: boolean
  onEdit: () => void
  onDelete: () => Promise<void>
  onDropBefore: (draggedTaskId: string) => void
}

function formatDueDate(dueDate: string) {
  const [year, month, day] = dueDate.split("-").map(Number)
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function TaskCard({ task, isDone = false, onEdit, onDelete, onDropBefore }: TaskCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { getPersonById } = usePeople()
  const assignee = getPersonById(task.assigneeId)
  const today = new Date().toISOString().slice(0, 10)
  const isOverdue = !isDone && !!task.dueDate && task.dueDate < today

  async function handleDelete() {
    setIsDeleting(true)
    setError(null)
    try {
      await onDelete()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task.")
      throw err
    } finally {
      setIsDeleting(false)
    }
  }

  function handleDragStart(event: DragEvent) {
    event.dataTransfer.setData("text/plain", task.id)
    event.dataTransfer.effectAllowed = "move"
    setIsDragging(true)
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault()
    event.stopPropagation()
    const draggedId = event.dataTransfer.getData("text/plain")
    if (draggedId && draggedId !== task.id) onDropBefore(draggedId)
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={() => setIsDragging(false)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
      className={cn(
        "group cursor-grab rounded-lg border border-border bg-card p-3 shadow-sm transition-all hover:shadow-md hover:border-ring/40 active:cursor-grabbing",
        isDragging && "opacity-40",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="text-left text-sm font-medium leading-snug hover:underline"
        >
          {task.title}
        </button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={() => {
            setError(null)
            setConfirmOpen(true)
          }}
        >
          <Trash2 className="size-3.5" />
          <span className="sr-only">Delete task</span>
        </Button>
      </div>

      {task.description && (
        <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{task.description}</p>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        {task.dueDate ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs",
              isOverdue ? "font-medium text-destructive" : "text-muted-foreground",
            )}
          >
            <CalendarDays className="size-3.5" />
            {formatDueDate(task.dueDate)}
          </span>
        ) : (
          <span />
        )}
        <PersonAvatar person={assignee} size="sm" />
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete task"
        description={`Delete "${task.title}"? This cannot be undone.`}
        confirmLabel={isDeleting ? "Deleting..." : "Delete"}
        isConfirming={isDeleting}
        error={error}
        onConfirm={handleDelete}
      />
    </div>
  )
}
