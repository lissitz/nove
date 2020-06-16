import { PostData } from "../types";
import { hasRedditVideo } from "./hasRedditVideo";
import { allowEmbeds } from "../constants";

export function hasVideo(post: PostData) {
  return (
    hasRedditVideo(post) ||
    post.domain === "gfycat.com" ||
    (post.secure_media?.oembed?.type === "video" && allowEmbeds)
  );
}
