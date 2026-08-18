import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import type { Person } from "@/types"
import { seedPeople, CURRENT_USER_ID } from "@/data/people"

const STORAGE_KEY = "devboard.people"
const ONBOARDED_KEY = "devboard.onboarded"

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-purple-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-indigo-500",
  "bg-lime-500",
]

function getInitials(name: string) {
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

interface PersonUpdate {
  name: string
  role: string
}

interface PeopleContextValue {
  people: Person[]
  hasOnboarded: boolean
  completeOnboarding: (update: PersonUpdate) => void
  addPerson: (name: string) => Person
  updatePerson: (id: string, update: PersonUpdate) => void
  getPersonById: (id: string | null) => Person | undefined
}

const PeopleContext = createContext<PeopleContextValue | null>(null)

function loadPeople(): Person[] {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return seedPeople
  try {
    return JSON.parse(stored) as Person[]
  } catch {
    return seedPeople
  }
}

export function PeopleProvider({ children }: { children: ReactNode }) {
  const [people, setPeople] = useState<Person[]>(loadPeople)
  const [hasOnboarded, setHasOnboarded] = useState(
    () => localStorage.getItem(ONBOARDED_KEY) === "true",
  )

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(people))
  }, [people])

  function addPerson(name: string): Person {
    const person: Person = {
      id: crypto.randomUUID(),
      name,
      role: "Team member",
      initials: getInitials(name),
      color: AVATAR_COLORS[people.length % AVATAR_COLORS.length],
    }
    setPeople((prev) => [...prev, person])
    return person
  }

  function updatePerson(id: string, update: PersonUpdate) {
    setPeople((prev) =>
      prev.map((person) =>
        person.id === id
          ? { ...person, name: update.name, role: update.role, initials: getInitials(update.name) }
          : person,
      ),
    )
  }

  function getPersonById(id: string | null): Person | undefined {
    if (!id) return undefined
    return people.find((person) => person.id === id)
  }

  function completeOnboarding(update: PersonUpdate) {
    updatePerson(CURRENT_USER_ID, update)
    localStorage.setItem(ONBOARDED_KEY, "true")
    setHasOnboarded(true)
  }

  return (
    <PeopleContext.Provider
      value={{ people, hasOnboarded, completeOnboarding, addPerson, updatePerson, getPersonById }}
    >
      {children}
    </PeopleContext.Provider>
  )
}

export function usePeople() {
  const context = useContext(PeopleContext)
  if (!context) {
    throw new Error("usePeople must be used within a PeopleProvider")
  }
  return context
}
