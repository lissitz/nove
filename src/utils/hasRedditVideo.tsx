import { PostData } from "../types";

export function hasRedditVideo(post: PostData) {
  return post.is_video && post.domain === "v.redd.it";
}
