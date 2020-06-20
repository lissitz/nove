/** @jsx jsx */
import { motion } from "framer-motion";
import * as React from "react";
import { useState, useReducer } from "react";
import { queryCache, AnyQueryKey } from "react-query";
import { jsx, useColorMode } from "theme-ui";
import {
  useDelete,
  useEdit,
  useMe,
  useMoreChildren,
  useSubmitComment,
} from "../api";
import { Type } from "../constants";
import { useIsAuthenticated } from "../contexts/authContext";
import { useTranslation } from "../i18n";
import { CommentChild, Fullname, ID, PostData, Vote } from "../types";
import type { CommentData, CommentSortType, MoreChildrenData } from "../types";
import {
  formatQuantity,
  formatTimestamp,
  sanitize,
  likesToVote,
} from "../utils/format";
import { getUserColor } from "../utils/getUserColor";
import Link from "./Link";
import LinkButton from "./LinkButton";
import Stack from "./Stack";
import TextEditor from "./TextEditor";
import CommentVotePanel from "./CommentVotePanel";

type VoteState = { vote: Vote; score: number | undefined };
type VoteAction = { dir: Vote };

export default function Comment({
  comment,
  community,
  postId,
  sort,
  showContext = false,
}: {
  comment: CommentChild;
  community: string;
  postId: string;
  sort: CommentSortType;
  showContext?: boolean;
}) {
  const t = useTranslation();
  const isAuthenticated = useIsAuthenticated();
  const { data: me } = useMe();
  const [del] = useDelete({
    onSuccess: () => {
      queryCache.refetchQueries(["comments", postId]);
      queryCache.setQueryData(["content", postId], (data: PostData) => {
        return data?.num_comments != null
          ? { ...data, num_comments: data.num_comments - 1 }
          : data;
      });
    },
  });
  const [expanded, setExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [colorMode] = useColorMode();
  const [{ score }, setScore] = useReducer(
    ({ score, vote }: VoteState, { dir }: VoteAction): VoteState => {
      return comment.kind === Type.Comment
        ? { score: score != null ? score + (dir - vote) : undefined, vote: dir }
        : { score: undefined, vote: 0 };
    },
    comment.kind === Type.Comment
      ? {
          score: comment.data.score,
          vote: likesToVote(comment.data.likes),
        }
      : { score: undefined, vote: 0 }
  );
  return comment.kind === "more" ? (
    <More
      postId={postId}
      data={comment.data}
      sort={sort}
      key={comment.data.id}
      community={community}
    />
  ) : (
    <div
      sx={{
        pl: 3,
        position: "relative",
        //prevents code or pre from overflowing
        maxWidth: "100%",
        width: "100%",
      }}
    >
      <Stack
        space={1}
        sx={{
          wordBreak: "break-word",
          "&:hover": {
            ".comment-vote-panel": {
              opacity: 1,
            },
            ".reply-button": {
              opacity: 1,
            },
          },
        }}
      >
        <div
          sx={{
            color: "textSecondary",
            fontSize: 0,
            "> * + *": {
              ml: 2,
            },
          }}
        >
          <div sx={{ display: "inline" }}>
            <Link
              to={`/u/${comment.data.author}`}
              sx={{
                color: getUserColor(comment.data.distinguished) || "gray.8",
                fontWeight: comment.data.is_submitter ? "bold" : undefined,
              }}
            >
              {comment.data.author}
            </Link>
          </div>
          {comment.data.distinguished === "admin" && (
            <span>{t("comment.admin")}</span>
          )}
          {comment.data.distinguished === "moderator" && (
            <abbr
              title={t("comment.moderatorOfX", [comment.data.subreddit])}
              sx={{ "&&": { textDecoration: "none", cursor: "default" } }}
            >
              {t("comment.mod")}
            </abbr>
          )}
          {comment.data.is_submitter && (
            <abbr
              title={t("comment.originalPoster")}
              sx={{ "&&": { textDecoration: "none", cursor: "default" } }}
            >
              {t("comment.OP")}
            </abbr>
          )}
          <span>
            {score != null
              ? score === 1
                ? t("xPoint", [score.toString()])
                : t("xPoints", [formatQuantity(score, t)])
              : t("scoreHidden")}
          </span>
          <span>{formatTimestamp(Number(comment.data.created_utc), t)}</span>
          {showContext && (
            <React.Fragment>
              <Link
                to={`/r/${comment.data.subreddit}`}
              >{`/r/${comment.data.subreddit}`}</Link>
              <Link to={contextUrl(comment.data)}>
                {comment.data.link_title}
              </Link>
            </React.Fragment>
          )}
          {comment.data.stickied && (
            <span sx={{ color: getUserColor("moderator") }}>{t("sticky")}</span>
          )}
          {comment.data.edited !== false && (
            <span sx={{ textDecoration: "italic" }}>
              {t("comment.edited") +
                " " +
                formatTimestamp(Number(comment.data.edited), t)}
            </span>
          )}
          {isAuthenticated && !comment.data.locked && (
            <div
              className="reply-button"
              sx={{
                display: "inline",
                opacity: 0,
                transition: "opacity 200ms",
              }}
            >
              <LinkButton
                onClick={() => {
                  setIsReplying(true);
                }}
              >
                {t("reply")}
              </LinkButton>
            </div>
          )}
          {isAuthenticated && comment.data.author === me?.name && (
            <React.Fragment>
              <div sx={{ display: "inline" }}>
                <LinkButton
                  onClick={() => {
                    setIsEditing(true);
                  }}
                >
                  {t("edit")}
                </LinkButton>
              </div>
              <div sx={{ display: "inline" }}>
                <LinkButton
                  onClick={() => {
                    del(comment.data.name);
                  }}
                >
                  {t("delete")}
                </LinkButton>
              </div>
            </React.Fragment>
          )}
          <div
            className="comment-vote-panel"
            sx={{ display: "inline", opacity: 0, transition: "opacity 200ms" }}
          >
            <CommentVotePanel
              name={comment.data.name}
              setScore={setScore}
              vote={likesToVote(comment.data.likes)}
            />
          </div>
        </div>
        {isEditing ? (
          <CommentEditor
            community={community}
            text={comment.data.body}
            id={comment.data.name}
            postId={postId}
            sort={sort}
            setIsEditing={setIsEditing}
          />
        ) : (
          <div
            sx={{
              pl: 2,
              //prevents code or pre from overflowing
              maxWidth: "100%",
              width: "100%",
            }}
            dangerouslySetInnerHTML={{
              __html: sanitize(comment.data.body_html),
            }}
          />
        )}
      </Stack>
      <div sx={{ position: "relative", mt: 3, mb: 3 }}>
        {(comment.data.replies || isReplying) && (
          <React.Fragment>
            <button
              sx={{
                border: 0,
                background: "transparent",
                position: "absolute",
                left: 1,
                height: "100%",
                width: 10,
                cursor: "pointer",
                zIndex: 2,
                ...(colorMode === "default" && {
                  "&:hover": {
                    ".line": {
                      "&:after": {
                        opacity: 0.05,
                      },
                    },
                  },
                  "&:active": {
                    ".line": {
                      "&:after": {
                        opacity: 0.1,
                      },
                    },
                  },
                }),
              }}
              aria-label={
                expanded ? t("comment.collapse") : t("comment.expand")
              }
              onClick={() => {
                setExpanded((x) => !x);
              }}
            >
              <div
                className="line"
                sx={{
                  position: "relative",
                  top: 0,
                  bottom: 0,
                  backgroundColor: "muted",
                  left: "-1px",
                  width: 2,
                  margin: "0 auto",
                  height: "100%",
                  "&:after": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    transition: "0.2s",
                    opacity: 0,
                    backgroundColor: "text",
                  },
                }}
              />
            </button>
            <Stack
              as={motion.ul}
              asChild="li"
              initial={false}
              sx={{ overflow: "hidden", position: "relative" }}
              animate={
                expanded
                  ? { opacity: 1, height: "auto", visibility: "inherit" }
                  : {
                      opacity: 0,
                      height: 10,
                      transitionEnd: { visibility: "hidden" },
                    }
              }
              transition={{ type: "tween" }}
            >
              {isReplying && (
                <Reply
                  parentId={comment.data.name}
                  setIsReplying={setIsReplying}
                  commentsQueryKey={["comments", postId, community, sort, ""]}
                  comment={comment}
                  contentQueryKey={["content", postId]}
                />
              )}
              {comment.data.replies &&
                comment.data.replies.data.children.map((x) =>
                  x.kind === Type.Comment ? (
                    <Comment
                      comment={x}
                      postId={postId}
                      sort={sort}
                      key={x.data.id}
                      community={community}
                    />
                  ) : x.kind === "more" ? (
                    <More
                      postId={postId}
                      data={x.data}
                      sort={sort}
                      key={x.data.id}
                      community={community}
                    />
                  ) : null
                )}
            </Stack>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

function More({
  postId,
  community,
  data,
  sort,
}: {
  postId: string;
  community: string;
  data: MoreChildrenData;
  sort: CommentSortType;
}) {
  const t = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const { data: more, status } = useMoreChildren({
    should_fetch: expanded,
    id: data.id,
    postId,
    children: data.children,
    sort,
  });
  return more && more.json.data.things && expanded ? (
    <React.Fragment>
      {more.json.data.things.map((x) =>
        x.kind === Type.Comment ? (
          <li key={x.data.id}>
            <Comment
              comment={x}
              community={community}
              postId={postId}
              sort={sort}
            />
          </li>
        ) : x.kind === "more" ? (
          <More
            postId={postId}
            community={community}
            data={x.data}
            sort={sort}
            key={x.data.id}
          />
        ) : null
      )}
    </React.Fragment>
  ) : status === "loading" ? (
    <div sx={{ color: "link", fontSize: 1, ml: 3 }}>{t("comment.loading")}</div>
  ) : status === "error" ? (
    <div sx={{ color: "link", fontSize: 1, ml: 3 }}>
      {t("comment.error.more")}
    </div>
  ) : (
    <LinkButton
      sx={{ color: "link", fontSize: 1, ml: 3 }}
      onClick={() => setExpanded((x) => !x)}
    >
      {data.count === 1
        ? t("{} more reply", [data.count.toString()])
        : t("{} more replies", [formatQuantity(data.count, t)])}
    </LinkButton>
  );
}

export function contextUrl(data: CommentData) {
  return `/r/${data.subreddit}/comments/${data.link_id.slice(3)}/${
    data.parent_id.startsWith(Type.Comment) ? data.parent_id.slice(3) : ""
  }`;
}

function CommentEditor({
  community,
  text,
  id,
  sort,
  postId,
  setIsEditing,
}: {
  community: string;
  text: string;
  id: Fullname;
  sort: string;
  postId: ID;
  setIsEditing: (x: boolean) => void;
}) {
  const [edit] = useEdit({
    onSuccess: (response, { id, text }) => {
      queryCache.setQueryData(
        ["comments", postId, community, sort, ""],
        (data: any) => {
          const index = data?.comments?.findIndex(
            (x: any) => x.data.name === id
          );
          if (index != null && response) {
            const comments = data?.comments?.slice();
            comments[index] = { kind: Type.Comment, data: response };
            return { comments };
          }
          return data;
        }
      );
    },
    onMutate: () => {},
  });
  return (
    <TextEditor
      text={text}
      onEdit={({ text }) => {
        edit({ id, text });
        setIsEditing(false);
      }}
      onCancel={() => {
        setIsEditing(false);
      }}
    />
  );
}

function Reply({
  commentsQueryKey,
  contentQueryKey,
  comment,
  parentId,
  setIsReplying,
}: {
  commentsQueryKey: string | AnyQueryKey;
  contentQueryKey: string | AnyQueryKey;
  comment: any;
  parentId: Fullname;
  setIsReplying: (x: boolean) => void;
}) {
  const [mutate] = useSubmitComment({
    onSuccess: (response) => {
      queryCache.setQueryData(commentsQueryKey, (data: any) => {
        // hack: we are mutating the cache to avoid searching the whole comment tree for the replies array to update
        // and recreating it. Probably not what react-query expects.
        const reply = response?.json?.data?.things?.[0];
        if (comment.data.replies) {
          comment.data.replies.data.children = [reply, ...comment.data.replies];
        } else {
          comment.data.replies = {
            data: {
              children: [reply],
            },
          };
        }
        return { ...data };
      });
      queryCache.setQueryData(contentQueryKey, (data: PostData) => {
        return data?.num_comments != null
          ? { ...data, num_comments: data.num_comments + 1 }
          : data;
      });
    },
  });
  return (
    <div sx={{ pl: 3, width: "100%" }}>
      <div sx={{ pl: 2, pt: 1 }}>
        <TextEditor
          text=""
          onEdit={({ text }) => {
            mutate({ parent: parentId, text });
            setIsReplying(false);
          }}
          onCancel={() => {
            setIsReplying(false);
          }}
        />
      </div>
    </div>
  );
}
