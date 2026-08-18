import type { Person } from "@/types";

export const CURRENT_USER_ID = "p1";

export const seedPeople: Person[] = [
  {
    id: CURRENT_USER_ID,
    name: "",
    role: "",
    initials: "?",
    color: "bg-blue-500",
  },
];
