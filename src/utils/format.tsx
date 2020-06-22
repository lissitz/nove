import { sanitize } from "dompurify";
import type { Vote } from "../types";

export { sanitize };

export function likesToVote(likes: boolean | null) {
  if (likes == null) return 0;
  return likes ? 1 : -1;
}

export function voteToLikes(vote: Vote) {
  if (vote === 0) return null;
  return vote === 1;
}
