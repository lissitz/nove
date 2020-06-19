/** @jsx jsx */
import { Fragment, useState } from "react";
import { queryCache } from "react-query";
import { Card, Heading, jsx } from "theme-ui";
import { useDelete, useEdit } from "../api";
import { useTranslation } from "../i18n";
import { useNavigate } from "../router";
import { Fullname, ID, MeData, PostData } from "../types";
import {
  formatQuantity,
  formatTimestamp,
  likesToVote,
  sanitize,
} from "../utils/format";
import { getUserColor } from "../utils/getUserColor";
import { hasVideo } from "../utils/hasVideo";
import rem from "../utils/rem";
import { Column, Columns } from "./Columns";
import FlairBadge from "./FlairBadge";
import { Inline, Inlines } from "./Inline";
import Link from "./Link";
import LinkButton from "./LinkButton";
import Stack from "./Stack";
import TextEditor from "./TextEditor";
import Video from "./Video";
import VotePanel from "./VotePanel";

export default function Post({
  post,
  me,
  isPreview = false,
  showContext = false,
  ...rest
}: {
  post: PostData;
  me?: MeData;
  isPreview?: boolean;
  showContext?: boolean;
  [key: string]: any;
}) {
  const t = useTranslation();
  const external = !post.is_self;
  const hasImage = post.domain === "i.redd.it";
  const [isEditing, setIsEditing] = useState(false);
  const [del] = useDelete({
    onSuccess: () => {
      navigate(`/r/${post.subreddit}`);
    },
  });
  const navigate = useNavigate();
  return (
    <Card sx={{ width: "100%" }} {...rest}>
      <Stack space={2}>
        <Columns space={3} sx={{ width: "100%" }}>
          <Column sx={{ flex: "0 0 auto", width: rem(64) }}>
            <VotePanel
              postId={post.id}
              score={post.score}
              vote={likesToVote(post.likes)}
              community={post.subreddit}
            />
          </Column>
          <Column>
            <Stack space={1} sx={{ wordBreak: "break-word" }}>
              <div>
                {post.link_flair_text && <FlairBadge post={post} />}
                <Heading as="h3" sx={{ fontSize: 3, display: "inline" }}>
                  {external ? (
                    <Link external to={post.url}>
                      {post.title}
                    </Link>
                  ) : isPreview ? (
                    <Link to={post.permalink}>{post.title}</Link>
                  ) : (
                    post.title
                  )}
                </Heading>
              </div>
              <Inlines
                space={2}
                sx={{
                  color: "textSecondary",
                  fontSize: 0,
                }}
              >
                <Inline>
                  {t("postedBy")}{" "}
                  <Link
                    to={`/u/${post.author}`}
                    sx={{ color: getUserColor(post.distinguished) }}
                  >
                    {" " + post.author}
                  </Link>
                  {" " + formatTimestamp(Number(post.created_utc), t)}
                </Inline>
                {post.distinguished === "admin" && (
                  <Inline>
                    <div>{t("comment.admin")}</div>
                  </Inline>
                )}
                {post.distinguished === "moderator" && (
                  <Inline>
                    <abbr
                      title={t("comment.moderatorOfX", [post.subreddit])}
                      sx={{
                        "&&": { textDecoration: "none", cursor: "default" },
                      }}
                    >
                      {t("comment.mod")}
                    </abbr>
                  </Inline>
                )}
                {showContext && (
                  <Inline>
                    <Link
                      to={`/r/${post.subreddit}`}
                    >{`/r/${post.subreddit}`}</Link>
                  </Inline>
                )}
                {me && post.author === me.name && (
                  <Fragment>
                    <Inline>
                      <LinkButton
                        onClick={() => {
                          setIsEditing(true);
                        }}
                      >
                        {t("edit")}
                      </LinkButton>
                    </Inline>

                    <Inline>
                      <LinkButton
                        onClick={() => {
                          del(post.name);
                        }}
                      >
                        {t("delete")}
                      </LinkButton>
                    </Inline>
                  </Fragment>
                )}
              </Inlines>
              {isEditing ? (
                <PostEditor
                  text={post.selftext}
                  id={post.name}
                  postId={post.id}
                  setIsEditing={setIsEditing}
                />
              ) : (
                <div
                  sx={
                    isPreview
                      ? {
                          flex: "1 1 auto",
                          maxHeight: rem(256),
                          overflow: "hidden",
                          maskImage:
                            "linear-gradient(180deg, black 70%, transparent)",
                        }
                      : undefined
                  }
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html: sanitize(post.selftext_html),
                    }}
                  />
                </div>
              )}
              {isPreview ? (
                <Link to={post.permalink} sx={{ fontSize: 1 }} preload>
                  {t(post.num_comments === 1 ? "{} comment" : "{} comments", [
                    formatQuantity(post.num_comments, t),
                  ])}
                </Link>
              ) : (
                <div sx={{ justifyContent: "space-between", color: "text" }}>
                  {t(post.num_comments === 1 ? "xComment" : "xComments", [
                    formatQuantity(post.num_comments, t),
                  ])}
                </div>
              )}
            </Stack>
          </Column>
          {external &&
            !hasVideo(post) &&
            !hasImage &&
            post.thumbnail &&
            post.thumbnail !== "default" &&
            post.thumbnail !== "spoiler" && (
              <Column
                sx={{
                  flex: "0 0 auto",
                  ml: "auto",
                  width: rem(150),
                  height: rem(100),
                  overflow: "hidden",
                }}
              >
                <Link to={post.url} external>
                  <img
                    alt=""
                    sx={{
                      bg: "gray.2",
                      height: post.thumbnail_height || "100%",
                      width: post.thumbnail_width || "100%",
                      margin: "0 auto",
                    }}
                    src={post.thumbnail}
                  />
                </Link>
              </Column>
            )}
        </Columns>
        {hasImage && (
          <img
            sx={{ maxWidth: "100%", margin: "0 auto", maxHeight: "80vh" }}
            alt=""
            src={post.url}
          />
        )}
        <Video post={post} />
      </Stack>
    </Card>
  );
}

function PostEditor({
  text,
  id,
  postId,
  setIsEditing,
}: {
  text: string;
  id: Fullname;
  postId: ID;
  setIsEditing: (x: boolean) => void;
}) {
  const [edit] = useEdit({
    onSuccess: (response: PostData, { id, text }) => {
      queryCache.setQueryData(["content", postId], (data: PostData) => {
        return response;
      });
    },
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
