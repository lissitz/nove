/** @jsx jsx */
import { MouseEvent } from "react";
import { Card, Heading, jsx } from "theme-ui";
import { allowEmbeds } from "../constants";
import { useTranslation } from "../i18n";
import { useNavigate, usePreload } from "../router";
import type { PostData, PostSortType } from "../types";
import { formatQuantity, formatTimestamp, likesToVote, sanitize } from "../utils/format";
import { getUserColor } from "../utils/getUserColor";
import { hasAnInteractiveElementUnderneath } from "../utils/hasAnInteractiveElementUnderneath";
import rem from "../utils/rem";
import { Column, Columns } from "./Columns";
import Link from "./Link";
import Stack from "./Stack";
import VotePanel from "./VotePanel";

export default function PostPreview({
  post,
  community,
  sort,
  query,
  showContext = false,
}: {
  post: PostData;
  community: string;
  sort: PostSortType;
  query: string;
  showContext: boolean;
}) {
  const t = useTranslation();
  const external = !post.is_self;
  const navigate = useNavigate();
  const hasRedditVideo = post.is_video && post.domain === "v.redd.it";
  const hasVideo =
    hasRedditVideo ||
    post.domain === "gfycat.com" ||
    (post.secure_media?.oembed?.type === "video" && allowEmbeds);
  const preload = usePreload();
  const hasImage = post.domain === "i.redd.it";
  return (
    <Card
      sx={{ width: "100%", cursor: "pointer" }}
      onClick={(event: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => {
        if (!hasAnInteractiveElementUnderneath(event)) {
          navigate(post.permalink);
        }
      }}
      onMouseDown={(event: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => {
        if (!hasAnInteractiveElementUnderneath(event)) {
          preload(post.permalink);
        }
      }}
    >
      <Stack space={2}>
        <div sx={{ overflow: "hidden", width: "100%" }} onClick={(e) => e}>
          <Columns space={3}>
            <Column sx={{ flex: "0 0 auto", width: rem(64) }}>
              <VotePanel
                postId={post.id}
                score={post.score}
                vote={likesToVote(post.likes)}
                community={community}
                sort={sort}
                query={query}
              />
            </Column>
            <Column>
              <Stack space={1} sx={{ wordBreak: "break-word" }}>
                <div>
                  {post.link_flair_text && (
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
                  )}
                  <Heading as="h3" sx={{ fontSize: 3, display: "inline" }}>
                    <Link
                      external={external}
                      //don't use full reddit link for internal links
                      to={external ? post.url : post.permalink}
                    >
                      {post.title}
                    </Link>
                  </Heading>
                </div>
                <div
                  sx={{
                    color: "textSecondary",
                    fontSize: 0,
                    "> * + *": {
                      ml: 2,
                    },
                    display: "inline",
                  }}
                >
                  <div sx={{ display: "inline" }}>
                    {t("postedBy")}{" "}
                    <Link to={`/u/${post.author}`} sx={{ color: getUserColor(post.distinguished) }}>
                      {" " + post.author}
                    </Link>
                    {" " + formatTimestamp(Number(post.created_utc), t)}
                  </div>
                  {post.distinguished === "admin" && <span>{t("comment.admin")}</span>}
                  {post.distinguished === "moderator" && (
                    <abbr
                      title={t("comment.moderatorOfX", [community])}
                      sx={{ "&&": { textDecoration: "none", cursor: "default" } }}
                    >
                      {t("comment.mod")}
                    </abbr>
                  )}
                  {showContext && (
                    <div sx={{ display: "inline" }}>
                      <Link to={`/r/${post.subreddit}`}>{`/r/${post.subreddit}`}</Link>
                    </div>
                  )}
                </div>
                <div
                  sx={{
                    flex: "1 1 auto",
                    maxHeight: rem(256),
                    overflow: "hidden",
                    maskImage: "linear-gradient(180deg, black 70%, transparent)",
                  }}
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html: sanitize(post.selftext_html),
                    }}
                  />
                </div>
                <div
                  sx={{
                    justifyContent: "space-between",
                    color: "link",
                  }}
                >
                  <Link to={post.permalink} sx={{ fontSize: 1 }} preload>
                    {t(post.num_comments === 1 ? "{} comment" : "{} comments", [
                      formatQuantity(post.num_comments, t),
                    ])}
                  </Link>
                </div>
              </Stack>
            </Column>
            {external &&
              !hasVideo &&
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
                  <Link external to={post.url}>
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
        </div>
        {hasImage && (
          <img
            sx={{ maxWidth: "100%", margin: "0 auto", maxHeight: "80vh", borderRadius: 4 }}
            alt=""
            src={post.url}
          />
        )}
        {hasVideo &&
          (hasRedditVideo ? (
            <video
              sx={{ width: "100%", margin: "0 auto", maxHeight: "80vh", borderRadius: 4 }}
              controls
            >
              <source src={post.url + "/HLSPlaylist.m3u8"} type="application/vnd.apple.mpegURL" />
              <source src={post.url + "/DASH_1080"} type="video/mp4" />
              <source src={post.url + "/DASH_720"} type="video/mp4" />
              <source src={post.url + "/DASH_480"} type="video/mp4" />
              <source src={post.url + "/DASH_360"} type="video/mp4" />
              <source src={post.url + "/DASH_240"} type="video/mp4" />
              <source src={post.url + "/DASH_96"} type="video/mp4" />
            </video>
          ) : post.secure_media?.oembed?.html ? (
            <div
              sx={{
                width: "100%",
                maxWidth: "100%",
                overflow: "hidden",
                display: "flex",
                justifyContent: "center",
                "*": { maxWidth: "100%" },
              }}
              dangerouslySetInnerHTML={{ __html: post.secure_media?.oembed?.html || "" }}
            />
          ) : null)}
      </Stack>
    </Card>
  );
}
