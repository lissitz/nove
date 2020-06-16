import type { UserType } from "../types";

export function getUserColor(type: UserType) {
  return type === "moderator"
    ? "green.8"
    : type === "admin"
    ? "red.8"
    : undefined;
}
