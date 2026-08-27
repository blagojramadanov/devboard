import { useState } from "react"
import type { DragEvent } from "react"
import { Plus } from "lucide-react"
import type { Column, Task, TaskInput } from "@/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TaskCard } from "@/components/board-detail/TaskCard"
import { TaskDialog } from "@/components/board-detail/TaskDialog"

interface BoardColumnProps {
  column: Column
  onCreateTask: (input: TaskInput) => Promise<void>
  onUpdateTask: (taskId: string, input: TaskInput) => Promise<void>
  onDeleteTask: (taskId: string) => Promise<void>
  onDropTask: (taskId: string, targetIndex: number) => void
}

export function BoardColumn({
  column,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onDropTask,
}: BoardColumnProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  function handleColumnDrop(event: DragEvent) {
    event.preventDefault()
    const draggedId = event.dataTransfer.getData("text/plain")
    if (draggedId) onDropTask(draggedId, column.tasks.length)
  }

  return (
    <div
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleColumnDrop}
      className="flex flex-col rounded-xl bg-muted/40 p-3"
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium">{column.title}</h2>
          <Badge variant="secondary">{column.tasks.length}</Badge>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={() => setIsCreating(true)}>
          <Plus className="size-4" />
          <span className="sr-only">Add task</span>
        </Button>
      </div>

      <div className="flex min-h-16 flex-col gap-2">
        {column.tasks.length === 0 && (
          <p className="py-6 text-center text-xs text-muted-foreground">No tasks here</p>
        )}
        {column.tasks.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            isDone={column.id === "done"}
            onEdit={() => setEditingTask(task)}
            onDelete={() => onDeleteTask(task.id)}
            onDropBefore={(draggedId) => onDropTask(draggedId, index)}
          />
        ))}
      </div>

      {isCreating && (
        <TaskDialog
          heading={`Add task to ${column.title}`}
          submitLabel="Create task"
          onClose={() => setIsCreating(false)}
          onSubmit={(input) => onCreateTask(input)}
        />
      )}

      {editingTask && (
        <TaskDialog
          heading="Edit task"
          submitLabel="Save changes"
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSubmit={(input) => onUpdateTask(editingTask.id, input)}
        />
      )}
    </div>
  )
}
