/** @jsx jsx */
import * as React from "react";
import { Helmet } from "react-helmet-async";
import { Card, jsx } from "theme-ui";
import { useMe, usePostContent } from "../api";
import CardError from "./CardError";
import Post from "./Post";
import Skeleton from "./Skeleton";

export default function PostContent({
  community,
  postId,
}: {
  community: string;
  postId: string;
}) {
  const { data: me } = useMe();
  const { data: post, status } = usePostContent(postId, community);
  if (status === "loading" || !post) return <Skeleton as={Card} />;
  else if (status === "error") return <CardError />;
  return (
    <React.Fragment>
      <Helmet>
        <title>{`${post.title} - ${community}`}</title>
      </Helmet>
      <Post as="article" post={post} me={me} />
    </React.Fragment>
  );
}
