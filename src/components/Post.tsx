/** @jsx jsx */
import { Fragment, useState } from "react";
import { queryCache } from "react-query";
import { Card, jsx } from "theme-ui";
import { useDelete, useEdit } from "../api";
import { useBreakpoint } from "../contexts/MediaQueryContext";
import { useFormat, useTranslation } from "../i18n";
import { useNavigate } from "../router";
import { Fullname, ID, MeData, PostData } from "../types";
import { likesToVote, sanitize } from "../utils/format";
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
import AspectRatio from "./AspectRatio";
import { headerHeight } from "../constants";
import { theme } from "../theme/theme";

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
  const format = useFormat();
  const external = !post.is_self;
  const hasImage = post.domain === "i.redd.it";
  const [isEditing, setIsEditing] = useState(false);
  const [del] = useDelete({
    onSuccess: () => {
      navigate(`/r/${post.subreddit}`);
    },
  });

  const navigate = useNavigate();
  const breakpoint = useBreakpoint();
  const mobile = breakpoint === "mobile";

  const commentLink = isPreview ? (
    <Link
      to={post.permalink}
      sx={{
        fontSize: 1,
        color: [null, "link"],
      }}
      preload
    >
      {t(post.num_comments === 1 ? "xComment" : "xComments", [
        format.quantity(post.num_comments, t),
      ])}
    </Link>
  ) : (
    <div sx={{ justifyContent: "space-between", color: "text" }}>
      {t(post.num_comments === 1 ? "xComment" : "xComments", [
        format.quantity(post.num_comments, t),
      ])}
    </div>
  );
  const H = isPreview ? "h2" : "h1";
  const imageRatio =
    (post.preview?.images?.[0].source?.height ?? 0) /
    (post.preview?.images?.[0].source?.width ?? 1);
  return (
    <Card sx={{ width: "100%" }} {...rest}>
      <Stack space={2}>
        <Columns space={3} sx={{ width: "100%" }}>
          {!mobile && (
            <Column sx={{ flex: "0 0 auto", width: rem(64) }}>
              <VotePanel
                postId={post.id}
                score={post.score}
                vote={likesToVote(post.likes)}
                community={post.subreddit}
              />
            </Column>
          )}
          <Column
            //fix pre code overflow
            sx={{ maxWidth: [null, `calc(100% - ${rem(64)})`] }}
          >
            <Stack space={1} sx={{ wordBreak: "break-word" }}>
              <div>
                {!showContext && post.link_flair_text && (
                  <section
                    aria-label={t("flair")}
                    sx={{ display: "inline-block" }}
                  >
                    <FlairBadge post={post} />
                  </section>
                )}
                <H sx={{ fontSize: 3, display: "inline" }}>
                  {external ? (
                    <Link
                      external
                      to={post.url}
                      sx={{
                        "&&": {
                          ":hover": {
                            textDecoration: ["none", null, "underline"],
                          },
                        },
                      }}
                    >
                      {post.title}
                    </Link>
                  ) : isPreview ? (
                    <Link
                      to={post.permalink}
                      sx={{
                        "&&": {
                          ":hover": {
                            textDecoration: ["none", null, "underline"],
                          },
                        },
                      }}
                    >
                      {post.title}
                    </Link>
                  ) : (
                    post.title
                  )}
                </H>
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
                    sx={{
                      color: getUserColor(post.distinguished),
                    }}
                  >
                    {" " + post.author}
                  </Link>
                  {" " + format.timestamp(Number(post.created_utc), t)}
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
                          maxWidth: "100%",
                          maskImage:
                            "linear-gradient(180deg, black 70%, transparent)",
                        }
                      : {
                          maxWidth: "100%",
                          overflow: "hidden",
                        }
                  }
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html: sanitize(post.selftext_html),
                    }}
                  />
                </div>
              )}
              {!mobile && commentLink}
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
                  width: [rem(100), rem(150)],
                  overflow: "hidden",
                }}
              >
                <Link
                  to={post.url}
                  external
                  sx={{
                    borderRadius: 4,
                    display: "block",
                    lineHeight: 0,
                    overflow: "hidden",
                  }}
                >
                  <AspectRatio
                    ratio={
                      (post.thumbnail_height || 0) / (post.thumbnail_width || 1)
                    }
                  >
                    <img
                      loading="lazy"
                      alt=""
                      sx={{
                        bg: "background",
                        margin: "0 auto",
                        width: "100%",
                        height: "100%",
                      }}
                      src={post.thumbnail}
                    />
                  </AspectRatio>
                </Link>
              </Column>
            )}
        </Columns>
        {hasImage && (
          <AspectRatio
            sx={{
              width: "100%",
              height: "100%",
              // we want images to fit the viewport height
              // max-height =  100vh - headerHeight - margin
              // max-width =  max-height / imageRatio
              maxWidth: `calc((100vh - ${
                headerHeight + 64
              }px) / ${imageRatio})`,
              margin: "0 auto",
            }}
            ratio={imageRatio}
          >
            <img
              loading="lazy"
              sx={{
                width: "100%",
                height: "100%",
                margin: "0 auto",
                borderRadius: 4,
                bg: "background",
              }}
              alt=""
              src={post.url}
              srcSet={post.preview?.images?.[0].resolutions
                .map((x) => `${x.url} ${x.width}w`)
                .join(",")}
              //the maximum width an image can take for desktop is ~600 pixel so anything above is overkill
              sizes={`(min-width: ${theme.breakpoints[1]}) 610px`}
            />
          </AspectRatio>
        )}
        <Video post={post} />
        {mobile && (
          <div
            sx={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              alignItems: "center",
            }}
          >
            <VotePanel
              postId={post.id}
              score={post.score}
              vote={likesToVote(post.likes)}
              community={post.subreddit}
            />
            <div sx={{ display: "flex", alignItems: "center", height: "100%" }}>
              {commentLink}
            </div>
          </div>
        )}
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
      queryCache.setQueryData<PostData>(["content", postId], (data) => {
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
