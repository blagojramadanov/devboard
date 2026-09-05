import { useState } from "react"
import type { KeyboardEvent } from "react"
import { cn } from "@/lib/utils"

interface InlineEditableTextProps {
  value: string
  onSave: (value: string) => void | Promise<void>
  as?: "h1" | "p" | "span"
  placeholder?: string
  className?: string
  isSaving?: boolean
  error?: string | null
}

export function InlineEditableText({
  value,
  onSave,
  as: Tag = "span",
  placeholder,
  className,
  isSaving = false,
  error = null,
}: InlineEditableTextProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  function startEditing() {
    setDraft(value)
    setIsEditing(true)
  }

  async function commit() {
    const trimmed = draft.trim()
    if (!trimmed || trimmed === value) {
      setDraft(value)
      setIsEditing(false)
      return
    }

    try {
      await onSave(trimmed)
      setIsEditing(false)
    } catch {
      void 0
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") commit()
    if (event.key === "Escape") {
      setDraft(value)
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <>
        <input
          autoFocus
          value={draft}
          placeholder={placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          disabled={isSaving}
          className={cn(
            "-ml-1.5 rounded-md border border-input bg-transparent px-1.5 py-0.5 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            className,
          )}
        />
        {error && <p className="mt-1 text-xs font-normal text-destructive">{error}</p>}
      </>
    )
  }

  return (
    <Tag onClick={startEditing} title="Click to edit" className={cn("cursor-text", className)}>
      {value || placeholder}
    </Tag>
  )
}
