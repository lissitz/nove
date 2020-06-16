/** @jsx jsx */
import { jsx } from "theme-ui";
import { PostData } from "../types";
import { hasRedditVideo } from "../utils/hasRedditVideo";
import { hasVideo } from "../utils/hasVideo";

export default function Video({ post }: { post: PostData }) {
  return hasVideo(post) ? (
    hasRedditVideo(post) ? (
      <video
        sx={{
          width: "100%",
          margin: "0 auto",
          maxHeight: "80vh",
          borderRadius: 4,
        }}
        controls
      >
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
