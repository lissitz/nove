/** @jsx jsx */
import { motion } from "framer-motion";
import * as React from "react";
import { useReducer, useState } from "react";
import { AnyQueryKey, queryCache } from "react-query";
import { jsx, useColorMode } from "theme-ui";
import {
  useDelete,
  useEdit,
  useMe,
  useMoreChildren,
  useSubmitComment,
} from "../api";
import { Type } from "../constants";
import { useIsAuthenticated, useAccessToken } from "../contexts/authContext";
import { useFormat, useTranslation } from "../i18n";
import {
  CommentChild,
  Fullname,
  ID,
  PostData,
  Vote,
  PostCommentsData,
} from "../types";
import type { CommentData, CommentSortType, MoreChildrenData } from "../types";
import { likesToVote, sanitize } from "../utils/format";
import { getUserColor } from "../utils/getUserColor";
import CommentVotePanel from "./CommentVotePanel";
import Link from "./Link";
import LinkButton from "./LinkButton";
import Stack from "./Stack";
import TextEditor from "./TextEditor";

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
  return comment.kind === "more" ? (
    <More
      postId={postId}
      data={comment.data}
      sort={sort}
      key={comment.data.id}
      community={community}
    />
  ) : (
    <TrueComment
      comment={comment.data}
      postId={postId}
      sort={sort}
      key={comment.data.id}
      community={community}
      showContext={showContext}
    />
  );
}

type VoteState = { vote: Vote; score: number | undefined };
type VoteAction = { dir: Vote };

function reducer({ score, vote }: VoteState, { dir }: VoteAction): VoteState {
  return {
    score: score != null ? score + (dir - vote) : undefined,
    vote: dir,
  };
}

function TrueComment({
  comment,
  postId,
  community,
  sort,
  showContext,
}: {
  comment: CommentData;
  postId: string;
  community: string;
  sort: CommentSortType;
  showContext: boolean;
}) {
  const t = useTranslation();
  const format = useFormat();
  const isAuthenticated = useIsAuthenticated();
  const { data: me } = useMe();
  const [del] = useDelete({
    onSuccess: () => {
      queryCache.invalidateQueries(["comments", postId]);
      queryCache.setQueryData<PostData>(["content", postId], (data) => {
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

  const [{ score }, setScore] = useReducer(reducer, {
    score: comment.score,
    vote: likesToVote(comment.likes),
  });
  const token = useAccessToken();
  return (
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
          ".reveal": {
            opacity: 0,
            transition: "opacity 200ms",
          },
          "&:hover": {
            ".reveal": {
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
            "> *": {
              display: "inline",
            },
          }}
        >
          <div>
            <Link
              to={`/u/${comment.author}`}
              sx={{
                color: getUserColor(comment.distinguished) || "textTertiary",
                fontWeight: comment.is_submitter ? "bold" : undefined,
              }}
            >
              {comment.author}
            </Link>
          </div>
          {comment.distinguished === "admin" && (
            <span>{t("comment.admin")}</span>
          )}
          {comment.distinguished === "moderator" && (
            <abbr
              title={t("comment.moderatorOfX", [comment.subreddit])}
              sx={{ "&&": { textDecoration: "none", cursor: "default" } }}
            >
              {t("comment.mod")}
            </abbr>
          )}
          {comment.is_submitter && (
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
                : t("xPoints", [format.quantity(score, t)])
              : t("scoreHidden")}
          </span>
          <span>{format.timestamp(Number(comment.created_utc), t)}</span>
          {showContext && (
            <React.Fragment>
              <Link
                to={`/r/${comment.subreddit}`}
              >{`/r/${comment.subreddit}`}</Link>
              <Link to={contextUrl(comment)}>{comment.link_title}</Link>
            </React.Fragment>
          )}
          {comment.stickied && (
            <span sx={{ color: getUserColor("moderator") }}>{t("sticky")}</span>
          )}
          {comment.edited !== false && (
            <span sx={{ textDecoration: "italic" }}>
              {t("comment.edited") +
                " " +
                format.timestamp(Number(comment.edited), t)}
            </span>
          )}
          {isAuthenticated && !comment.locked && (
            <div className="reveal">
              <LinkButton
                onClick={() => {
                  setIsReplying(true);
                }}
              >
                {t("comment.reply")}
              </LinkButton>
            </div>
          )}
          {isAuthenticated && comment.author === me?.name && (
            <React.Fragment>
              <div className="reveal">
                <LinkButton
                  onClick={() => {
                    setIsEditing(true);
                  }}
                >
                  {t("edit")}
                </LinkButton>
              </div>
              <div className="reveal">
                <LinkButton
                  onClick={() => {
                    del(comment.name);
                  }}
                >
                  {t("delete")}
                </LinkButton>
              </div>
            </React.Fragment>
          )}
          <div className="reveal">
            <CommentVotePanel
              name={comment.name}
              setScore={setScore}
              vote={likesToVote(comment.likes)}
            />
          </div>
        </div>
        {isEditing ? (
          <CommentEditor
            community={community}
            text={comment.body}
            id={comment.name}
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
              __html: sanitize(comment.body_html),
            }}
          />
        )}
      </Stack>
      <div sx={{ position: "relative", mt: 3, mb: 3 }}>
        {(comment.replies || isReplying) && (
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
                  parentId={comment.name}
                  setIsReplying={setIsReplying}
                  commentsQueryKey={[
                    "comments",
                    postId,
                    community,
                    sort,
                    "",
                    !!token,
                  ]}
                  comment={comment}
                  contentQueryKey={["content", postId]}
                />
              )}
              {comment.replies &&
                comment.replies.data.children.map((x) =>
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
  const format = useFormat();
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
        : t("{} more replies", [format.quantity(data.count, t)])}
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
      queryCache.setQueryData<PostCommentsData>(
        ["comments", postId, community, sort, ""],
        (data) => {
          const index = data?.comments.findIndex((x) => x.data.name === id);
          if (index != null && response) {
            const comments = data?.comments.slice();
            if (comments) {
              comments[index] = { kind: Type.Comment, data: response };
              return { comments };
            }
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
  comment: CommentData;
  parentId: Fullname;
  setIsReplying: (x: boolean) => void;
}) {
  const [mutate] = useSubmitComment({
    onSuccess: (response) => {
      queryCache.setQueryData<PostCommentsData>(commentsQueryKey, (data) => {
        // hack: we are mutating the cache to avoid searching the whole comment tree for the replies array to update
        // and recreating it. Probably not what react-query expects.
        const reply = response?.json?.data?.things?.[0];
        if (comment.replies) {
          comment.replies.data.children = [
            reply,
            ...comment.replies.data.children,
          ];
        } else {
          comment.replies = {
            data: {
              children: [reply],
            },
          };
        }
        return data ? { comments: data.comments } : undefined;
      });
      queryCache.setQueryData<PostData>(contentQueryKey, (data) => {
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
