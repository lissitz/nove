/** @jsx jsx */

import * as React from "react";
import { Suspense, Fragment } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams } from "react-router-dom";
import { Card, jsx } from "theme-ui";
import { useCommunityInfo, useInfinitePosts } from "../api";
import { useTranslation } from "../i18n";
import type { PostData, PostSortType } from "../types";
import rem from "../utils/rem";
import Button from "./Button";
import CardError from "./CardError";
import PostPreview from "./PostPreview";
import Skeleton from "./Skeleton";
import Stack from "./Stack";
import { isCombinedCommunity } from "../utils/isCombinedCommunity";

export default function PostList({
  community,
  sort,
}: {
  community: string;
  sort: PostSortType;
}) {
  return (
    <div sx={{ width: "100%" }}>
      <Content community={community} sort={sort} />
    </div>
  );
}
function Content({
  community,
  sort,
}: {
  community: string;
  sort: PostSortType;
}) {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  let {
    data: posts,
    fetchMore,
    status,
    canFetchMore,
    isFetchingMore,
  } = useInfinitePosts(community, sort, query);
  const t = useTranslation();
  return status === "success" ? (
    <Fragment>
      <Meta community={community} />
      <Stack space={[0, null, 3]}>
        {posts &&
          posts.map((group, index) => (
            <Stack
              as="ul"
              asChild="li"
              space={[0, null, 3]}
              sx={{ maxWidth: "100%" }}
            >
              {group.data.children.map((post: { data: PostData }) => (
                <PostPreview
                  post={post.data}
                  key={post.data.id}
                  showContext={isCombinedCommunity(community)}
                />
              ))}
            </Stack>
          ))}
      </Stack>
      {(canFetchMore || isFetchingMore) && (
        <Button
          sx={{ my: 3, mx: "auto", width: "100%" }}
          onClick={() => fetchMore()}
          disabled={isFetchingMore}
        >
          {isFetchingMore ? t("postList.loadingMore") : t("postList.loadMore")}
        </Button>
      )}
    </Fragment>
  ) : status === "loading" || status === "idle" ? (
    <Fragment>
      <Suspense fallback={null}>
        <Meta community={community} />
      </Suspense>
      <Stack space={[0, null, 3]} aria-hidden>
        {Array(50)
          .fill(null)
          .map((_, index) => (
            <Skeleton as={Card} key={index} />
          ))}
      </Stack>
    </Fragment>
  ) : (
    <React.Fragment>
      <CardError />
      <Stack space={[0, null, 3]} aria-hidden>
        {Array(10).map((_, index) => (
          <Card sx={{ height: rem(150) }} key={index} />
        ))}
      </Stack>
    </React.Fragment>
  );
}

function Meta({ community }: { community: string }) {
  let { data: info } = useCommunityInfo(community);
  return isCombinedCommunity(community) ? (
    community === "" ? (
      <Helmet>
        <title />
      </Helmet>
    ) : (
      <Helmet>
        <title>{`r/${community}`}</title>
      </Helmet>
    )
  ) : (
    <Helmet>
      <title>{info?.data.title || ""}</title>
    </Helmet>
  );
}
