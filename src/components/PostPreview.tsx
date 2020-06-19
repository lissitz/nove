/** @jsx jsx */
import { MouseEvent } from "react";
import { jsx } from "theme-ui";
import { useNavigate, usePreload } from "../router";
import type { PostData } from "../types";
import { hasAnInteractiveElementUnderneath } from "../utils/hasAnInteractiveElementUnderneath";
import Post from "./Post";

export default function PostPreview({
  post,
  showContext = false,
}: {
  post: PostData;
  showContext: boolean;
}) {
  const navigate = useNavigate();
  const preload = usePreload();
  return (
    <Post
      post={post}
      isPreview
      showContext={showContext}
      sx={{
        width: "100%",
        cursor: "pointer",
        "-webkit-tap-highlight-color": "rgba(0,0,0,0)",
      }}
      onClick={(event: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => {
        if (!hasAnInteractiveElementUnderneath(event)) {
          navigate(post.permalink);
        }
      }}
      onMouseDown={(
        event: MouseEvent<HTMLDivElement, globalThis.MouseEvent>
      ) => {
        if (!hasAnInteractiveElementUnderneath(event)) {
          preload(post.permalink);
        }
      }}
    />
  );
}
