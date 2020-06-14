/** @jsx jsx */
import * as React from "react";
import { Card, jsx } from "theme-ui";
import { useNavigate } from "../router";
import { usePreload } from "../router/";
import { Comment as TComment, CommentData } from "../types";
import { hasAnInteractiveElementUnderneath } from "../utils/hasAnInteractiveElementUnderneath";
import Comment, { contextUrl } from "./Comment";

export default function UserOverviewComment({
  comment,
}: {
  comment: { kind: TComment; data: CommentData };
}) {
  const navigate = useNavigate();
  const preload = usePreload();
  return (
    <Card
      sx={{ width: "100%", cursor: "pointer" }}
      onClick={(event: React.MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => {
        if (!hasAnInteractiveElementUnderneath(event)) {
          navigate(contextUrl(comment.data));
        }
      }}
      onMouseDown={(event: React.MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => {
        if (!hasAnInteractiveElementUnderneath(event)) {
          preload(contextUrl(comment.data));
        }
      }}
    >
      <Comment
        postId={comment.data.link_id.slice(3)}
        comment={comment}
        sort="new"
        showContext
        community={comment.data.subreddit}
      />
    </Card>
  );
}
