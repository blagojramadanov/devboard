import { useState } from "react"
import type { KeyboardEvent } from "react"
import { cn } from "@/lib/utils"

interface InlineEditableTextProps {
  value: string
  onSave: (value: string) => void
  as?: "h1" | "p" | "span"
  placeholder?: string
  className?: string
}

export function InlineEditableText({
  value,
  onSave,
  as: Tag = "span",
  placeholder,
  className,
}: InlineEditableTextProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  function startEditing() {
    setDraft(value)
    setIsEditing(true)
  }

  function commit() {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== value) {
      onSave(trimmed)
    } else {
      setDraft(value)
    }
    setIsEditing(false)
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
      <input
        autoFocus
        value={draft}
        placeholder={placeholder}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        className={cn(
          "-ml-1.5 rounded-md border border-input bg-transparent px-1.5 py-0.5 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          className,
        )}
      />
    )
  }

  return (
    <Tag onClick={startEditing} title="Click to edit" className={cn("cursor-text", className)}>
      {value || placeholder}
    </Tag>
  )
}
