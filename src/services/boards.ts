import { supabase } from "@/lib/supabase"
import { createDefaultColumns } from "@/lib/columns"
import type { Board } from "@/types"

interface BoardRow {
  id: string
  title: string
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

export async function getBoards(): Promise<Board[]> {
  const { data, error } = await supabase
    .from("boards")
    .select("id, title, created_at")
    .order("created_at", { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch boards: ${error.message}`)
  }

  return (data ?? []).map(toBoard)
}
