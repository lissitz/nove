/** @jsx jsx */
import * as React from "react";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, jsx } from "theme-ui";
import { useUserPage } from "../api/user";
import { Type } from "../constants";
import usePrevious from "../hooks/usePrevious";
import { useTranslation } from "../i18n";
import { UserOverviewSortType } from "../types";
import { parseUserOverviewSort } from "../utils/params";
import rem from "../utils/rem";
import Button from "./Button";
import CardError from "./CardError";
import PostPreview from "./PostPreview";
import Skeleton from "./Skeleton";
import Stack from "./Stack";
import UserOverviewComment from "./UserOverviewComment";

export default function UserOverview({
  username,
  where,
}: {
  username: string;
  where: string;
}) {
  const [params] = useSearchParams();
  const sort = parseUserOverviewSort(params.get("sort"));
  const {
    data: overview,
    status,
    fetchMore,
    //@ts-ignore
    canFetchMore,
    isFetchingMore,
  } = useUserPage(username, where, params.toString());
  useScrollToTopOnSortChange(sort);
  const t = useTranslation();
  return (
    <div sx={{ width: "100%" }} id="userOverview">
      {status === "loading" || status === "idle" ? (
        <Stack space={[0, null, 3]} aria-hidden>
          {Array(25)
            .fill(undefined)
            .map((_, index) => (
              <Skeleton as={Card} height={rem(150)} key={index} />
            ))}
        </Stack>
      ) : status === "error" ? (
        <CardError />
      ) : (
        overview &&
        overview.length !== 0 && (
          <Stack space={[0, null, 3]}>
            {overview &&
              overview.map((group, index) => (
                <React.Fragment key={index}>
                  <Stack space={[0, null, 3]} sx={{ width: "100%" }}>
                    {group.data.children.map((x) =>
                      x.kind === Type.Link ? (
                        <PostPreview
                          key={x.data.id}
                          post={x.data}
                          showContext
                        />
                      ) : (
                        <UserOverviewComment comment={x} key={x.data.id} />
                      )
                    )}
                  </Stack>
                </React.Fragment>
              ))}
          </Stack>
        )
      )}
      {status === "success" && overview && (canFetchMore || isFetchingMore) && (
        <Button
          sx={{ margin: "16px auto" }}
          onClick={() => fetchMore()}
          disabled={isFetchingMore}
        >
          {isFetchingMore ? t("postList.loadingMore") : t("postList.loadMore")}
        </Button>
      )}
    </div>
  );
}

function useScrollToTopOnSortChange(sort: UserOverviewSortType) {
  const prevSort = usePrevious(sort);
  useEffect(() => {
    if (prevSort !== sort) {
      window.scroll({
        top: 0,
      });
    }
  }, [sort, prevSort]);
}
