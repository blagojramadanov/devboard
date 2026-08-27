import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import type { Board } from "@/types"
import { Button } from "@/components/ui/button"
import { InlineEditableText } from "@/components/shared/InlineEditableText"

interface BoardHeaderProps {
  board: Board
  onRename: (title: string) => Promise<void>
}

export function BoardHeader({ board, onRename }: BoardHeaderProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalTasks = board.columns.reduce((sum, column) => sum + column.tasks.length, 0)

  async function handleRename(title: string) {
    setIsSaving(true)
    setError(null)
    try {
      await onRename(title)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update board title.")
      throw err
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mb-6 flex items-center gap-3">
      <Button variant="ghost" size="icon-sm" nativeButton={false} render={<Link to="/" />}>
        <ArrowLeft className="size-4" />
        <span className="sr-only">Back to boards</span>
      </Button>

      <div>
        <InlineEditableText
          as="h1"
          value={board.title}
          onSave={handleRename}
          isSaving={isSaving}
          error={error}
          className="text-2xl font-semibold"
        />
        <p className="text-sm text-muted-foreground">
          {totalTasks === 0 ? "No tasks yet" : `${totalTasks} task${totalTasks === 1 ? "" : "s"}`}
        </p>
      </div>
    </div>
  )
}
