import type { Person } from "@/types";

export const CURRENT_USER_ID = "3f9d2b34-6c3a-4a0e-9c0a-5f2b8d4e7a11";

export const PEOPLE_STORAGE_KEY = "devboard.people";
export const ONBOARDED_STORAGE_KEY = "devboard.onboarded";

export const seedPeople: Person[] = [
  {
    id: CURRENT_USER_ID,
    name: "",
    role: "",
    initials: "?",
    color: "bg-blue-500",
  },
];
