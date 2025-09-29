import type { role } from "../models";

export const initialDataRoles: Record<
  (typeof role.$inferInsert)["name"],
  Required<Omit<typeof role.$inferInsert, "created_at" | "updated_at">>
> = {
  admin: {
    id: 1,
    name: "admin",
  },
  user: {
    id: 2,
    name: "user",
  },
  guest: {
    id: 3,
    name: "guest",
  },
  moderator: {
    id: 4,
    name: "moderator",
  },
};
