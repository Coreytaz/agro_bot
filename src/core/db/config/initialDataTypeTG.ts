import type { typeTG } from "../models";

export const initialDataTypeTG: Record<
  (typeof typeTG.$inferInsert)["name"],
  Required<Omit<typeof typeTG.$inferInsert, "created_at" | "updated_at">>
> = {
  private: {
    id: 1,
    name: "private",
    enable: 1,
  },
  group: {
    id: 2,
    name: "group",
    enable: 0,
  },
  supergroup: {
    id: 3,
    name: "supergroup",
    enable: 0,
  },
  channel: {
    id: 4,
    name: "channel",
    enable: 0,
  },
};
