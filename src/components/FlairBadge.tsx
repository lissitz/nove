/** @jsx jsx */
import { jsx } from "theme-ui";
import { PostData } from "../types";

export default function FlairBadge({ post }: { post: PostData }) {
  return (
    <div
      sx={{
        color: post.link_flair_background_color
          ? post.link_flair_text_color === "light"
            ? "white"
            : "black"
          : "text",
        backgroundColor: post.link_flair_background_color || "gray.1",
        display: "inline-block",
        fontSize: 1,
        fontWeight: "600",
        borderRadius: 16,
        py: 0,
        px: 2,
        mr: 2,
        verticalAlign: "text-bottom",
      }}
    >
      {post.link_flair_text}
    </div>
  );
}
