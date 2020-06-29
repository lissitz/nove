/** @jsx jsx */
import VisuallyHidden from "@reach/visually-hidden";
import { useState, Fragment } from "react";
import { FiPlay } from "react-icons/fi";
import { jsx } from "theme-ui";
import { useTranslation } from "../i18n";
import { PostData } from "../types";
import { hasRedditVideo } from "../utils/hasRedditVideo";
import { hasVideo } from "../utils/hasVideo";

export default function Video({ post }: { post: PostData }) {
  return hasVideo(post) ? (
    hasRedditVideo(post) ? (
      <RedditVideo post={post} />
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
        dangerouslySetInnerHTML={{
          __html: post.secure_media?.oembed?.html || "",
        }}
      />
    ) : null
  ) : null;
}

function RedditVideo({ post }: { post: PostData }) {
  const t = useTranslation();
  const [play, setPlay] = useState(false);
  return (
    <div
      sx={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        borderRadius: 4,
        pt: `calc(${
          Math.min(
            //@ts-ignore
            post.media.reddit_video.height / post.media.reddit_video.width,
            1
          ) * 100
        }%)`,
      }}
    >
      {play ? (
        <iframe
          title={t("iframeVideoTitle", [post.title])}
          src={`https://reddit.com/mediaembed/${post.id}`}
          sx={{
            border: "none",
            position: "absolute",
            background: "black",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        />
      ) : (
        <Fragment>
          <div
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              background: "black",
              height: "100%",
              width: "100%",
              display: "flex",
            }}
          >
            <img
              alt=""
              sx={{
                margin: "0 auto",
                maxWidth: "100%",
                maxHeight: "100%",
              }}
              //@ts-ignore
              src={post.preview.images[0].source.url}
            />
          </div>
          <button
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              opacity: "0.9",
            }}
            onClick={() => {
              setPlay(true);
            }}
          >
            <FiPlay
              sx={{ width: 44, height: 44, color: "white" }}
              aria-hidden="true"
            />
            <VisuallyHidden>{t("play")}</VisuallyHidden>
          </button>
        </Fragment>
      )}
    </div>
  );
}
