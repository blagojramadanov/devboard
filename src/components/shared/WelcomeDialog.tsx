import { useState } from "react"
import type { FormEvent } from "react"
import { usePeople } from "@/context/PeopleContext"
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
} from "@/components/ui/dialog"

export function WelcomeDialog() {
  const { hasOnboarded, completeOnboarding } = usePeople()
  const [name, setName] = useState("")
  const [role, setRole] = useState("")

  if (hasOnboarded) return null

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return
    completeOnboarding({ name: trimmedName, role: role.trim() })
  }

  return (
    <Dialog open onOpenChange={() => {}}>
      <DialogContent showCloseButton={false}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Welcome to DevBoard</DialogTitle>
            <DialogDescription>Tell us a bit about yourself to get started.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="welcome-name">Your name</Label>
              <Input
                id="welcome-name"
                autoFocus
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Alex Novak"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="welcome-role">Your role</Label>
              <Input
                id="welcome-role"
                value={role}
                onChange={(event) => setRole(event.target.value)}
                placeholder="e.g. Frontend Developer"
                className="mt-1.5"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={!name.trim()}>
              Get started
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
