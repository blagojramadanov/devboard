import { useState } from "react"
import type { FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { Plus } from "lucide-react"
import { useBoards } from "@/context/BoardsContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function CreateBoardDialog() {
  const { createBoard } = useBoards()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return

    setIsSubmitting(true)
    setError(null)
    try {
      const board = await createBoard(trimmed)
      setTitle("")
      setOpen(false)
      navigate(`/boards/${board.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create board.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) {
          setTitle("")
          setError(null)
        }
      }}
    >
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" />
        New board
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create board</DialogTitle>
            <DialogDescription>Give your new board a name to get started.</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="board-title">Board title</Label>
            <Input
              id="board-title"
              autoFocus
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Website Relaunch"
              className="mt-1.5"
              disabled={isSubmitting}
            />
            {error && <p className="mt-1.5 text-sm text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={!title.trim() || isSubmitting}>
              {isSubmitting ? "Creating..." : "Create board"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
