import { sanitize } from "dompurify";
import type { Vote } from "../types";

export { sanitize };

export function formatTimestamp(
  timestamp: number,
  t: (s: string, replace?: string[]) => string
) {
  let delta = Date.now() / 1000 - timestamp;
  delta = Math.floor(delta / 60);
  if (delta === 0) return t("<aMinute");
  if (delta === 1) return t("aMinute");
  if (delta < 60) return t("xMinutes", [delta.toString()]);
  delta = Math.floor(delta / 60);
  if (delta === 1) return t("anHour");
  if (delta < 24) return t("xHours", [delta.toString()]);
  delta = Math.floor(delta / 24);
  if (delta === 1) return t("aDay");
  if (delta < 30) return t("xDays", [delta.toString()]);
  delta = Math.floor(delta / 30);
  if (delta === 1) return t("aMonth");
  if (delta < 12) return t("xMonths", [delta.toString()]);
  delta = Math.floor(delta / 12);
  if (delta === 1) return t("aYear");
  else return t("xYears", [delta.toString()]);
}

export function formatQuantity(
  quantity: number,
  t: (s: string, replace?: string[]) => string
) {
  if (quantity > 999999) {
    return t("xm", [
      (quantity / 1000000).toLocaleString(undefined, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }),
    ]);
  } else if (quantity > 999) {
    return t("xk", [
      (quantity / 1000).toLocaleString(undefined, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }),
    ]);
  } else return quantity.toLocaleString(undefined);
}

export function likesToVote(likes: boolean | null) {
  if (likes == null) return 0;
  return likes ? 1 : -1;
}

export function voteToLikes(vote: Vote) {
  if (vote === 0) return null;
  return vote === 1;
}
