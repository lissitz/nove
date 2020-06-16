/** @jsx jsx */
import * as React from "react";
import { Fragment, useState } from "react";
import { Helmet } from "react-helmet-async";
import { queryCache } from "react-query";
import { Card, Heading, jsx } from "theme-ui";
import { useDelete, useEdit, useMe, usePostContent } from "../api";
import { useTranslation } from "../i18n";
import { useNavigate } from "../router";
import { Fullname, ID, PostData } from "../types";
import {
  formatQuantity,
  formatTimestamp,
  likesToVote,
  sanitize,
} from "../utils/format";
import { getUserColor } from "../utils/getUserColor";
import rem from "../utils/rem";
import CardError from "./CardError";
import { Column, Columns } from "./Columns";
import { Inline, Inlines } from "./Inline";
import Link from "./Link";
import LinkButton from "./LinkButton";
import Skeleton from "./Skeleton";
import Stack from "./Stack";
import TextEditor from "./TextEditor";
import VotePanel from "./VotePanel";

export default function PostContent({
  community,
  postId,
}: {
  community: string;
  postId: string;
}) {
  const t = useTranslation();
  const { data: post, status } = usePostContent(postId, community);
  const { data: me } = useMe();
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const [del] = useDelete({
    onSuccess: () => {
      navigate(`/r/${community}`);
    },
  });
  if (status === "loading" || !post) return <Skeleton as={Card} />;
  else if (status === "error") return <CardError />;
  const external = !post.is_self;
  const hasVideo = post.is_video && post.domain === "v.redd.it";
  const hasImage = post.domain === "i.redd.it";
  return (
    <React.Fragment>
      <Helmet>
        <title>{`${post.title} - ${community}`}</title>
      </Helmet>
      <Card sx={{ width: "100%" }}>
        <Stack space={2}>
          <Columns space={3} sx={{ width: "100%" }}>
            <Column sx={{ flex: "0 0 auto", width: rem(64) }}>
              <VotePanel
                postId={postId}
                score={post.score}
                vote={likesToVote(post.likes)}
                community={community}
                query=""
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
                        backgroundColor:
                          post.link_flair_background_color || "gray.1",
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
                    {external ? (
                      <Link external to={post.url}>
                        {post.title}
                      </Link>
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
                        title={t("comment.moderatorOfX", [community])}
                        sx={{
                          "&&": { textDecoration: "none", cursor: "default" },
                        }}
                      >
                        {t("comment.mod")}
                      </abbr>
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
                    dangerouslySetInnerHTML={{
                      __html: sanitize(post.selftext_html),
                    }}
                  />
                )}
                <div sx={{ justifyContent: "space-between", color: "text" }}>
                  {t(post.num_comments === 1 ? "xComment" : "xComments", [
                    formatQuantity(post.num_comments, t),
                  ])}
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
          {hasVideo && (
            <video
              sx={{ width: "100%", height: "auto", borderRadius: 4 }}
              controls
              src={post.url + "/DASHPlaylist.mpd"}
              data-shaka-player
            >
              <source src={post.url + "/DASHPlaylist.mpd"} />
              <source
                src={post.url + "/HLSPlaylist.m3u8"}
                type="application/vnd.apple.mpegURL"
              />
              <source src={post.url + "/DASH_1080"} type="video/mp4" />
              <source src={post.url + "/DASH_720"} type="video/mp4" />
              <source src={post.url + "/DASH_480"} type="video/mp4" />
              <source src={post.url + "/DASH_360"} type="video/mp4" />
              <source src={post.url + "/DASH_240"} type="video/mp4" />
              <source src={post.url + "/DASH_96"} type="video/mp4" />
            </video>
          )}
        </Stack>
      </Card>
    </React.Fragment>
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
