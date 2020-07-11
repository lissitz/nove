/** @jsx jsx */
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, jsx } from "theme-ui";
import { usePostComments, usePostContent } from "../api";
import { headerHeight } from "../constants";
import usePrevious from "../hooks/usePrevious";
import { theme } from "../theme/theme";
import { CommentSortType } from "../types";
import { parseCommentSort } from "../utils/params";
import rem from "../utils/rem";
import CardError from "./CardError";
import Comment from "./Comment";
import Skeleton from "./Skeleton";
import Stack from "./Stack";
import CommentForm from "./CommentForm";
import { useAccessToken } from "../contexts/authContext";

const maxSkeletonComments = 100;
export default function CommentList({
  community,
  postId,
}: {
  community: string;
  postId: string;
}) {
  const [params] = useSearchParams();
  const sort = parseCommentSort(params.get("sort"));
  const { data, status } = usePostComments(community, postId, sort, "");
  const { data: post } = usePostContent(postId, community);
  const comments = data?.comments;
  useScrollToTopCommentOnSortChange(sort);
  const token = useAccessToken();

  return (
    <Stack space={[0, null, 3]} sx={{ width: "100%" }}>
      {(!post || !post.archived) && (
        <CommentForm
          postId={postId}
          contentQueryKey={["content", postId]}
          commentsQueryKey={["comments", postId, community, sort, "", !!token]}
        />
      )}
      <div sx={{ width: "100%" }} id="comments">
        {status === "loading" || status === "idle" ? (
          <Skeleton
            as={Card}
            height={rem(
              100 *
                (post?.num_comments
                  ? Math.min(maxSkeletonComments, post.num_comments)
                  : 10)
            )}
          />
        ) : status === "error" ? (
          <CardError />
        ) : (
          comments &&
          comments.length !== 0 && (
            <Card
              sx={{
                //the top comment will add padding
                pl: 0,
              }}
            >
              <Stack as="ul" asChild="li">
                {comments.map((comment, index) => (
                  <Comment
                    community={community}
                    comment={comment}
                    key={comment.data.id}
                    postId={postId}
                    sort={sort}
                  />
                ))}
              </Stack>
            </Card>
          )
        )}
      </div>
    </Stack>
  );
}

const margin = theme.space[4];
function useScrollToTopCommentOnSortChange(sort: CommentSortType) {
  const prevSort = usePrevious(sort) || sort;
  useEffect(() => {
    if (prevSort !== sort) {
      const comments =
        document.getElementById("comments")!.getBoundingClientRect().top +
        window.scrollY -
        headerHeight -
        remToPx(margin);
      window.scroll({
        top: comments,
      });
    }
  }, [sort, prevSort]);
}

function remToPx(rem: string) {
  return Number(rem.slice(0, -3)) / 0.0625;
}
