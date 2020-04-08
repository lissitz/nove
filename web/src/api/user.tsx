import { queryCache, useInfiniteQuery, useQuery } from "react-query";
import { useAccessToken } from "../contexts/authContext";
import type { Account, Fullname, UserInfo, UserOverviewResponse } from "../types";
import { fetchAuth, getFetchMore } from "./common";

function getUserInfo(username: string, token?: string) {
  return (fetchAuth(`/user/${username}/about.json`, token) as Promise<{
    kind: Account;
    data: UserInfo;
  }>).then((x) => x.data);
}

export function prefetchUserInfo(token: string | undefined, username: string) {
  return queryCache.prefetchQuery(["about/user", username, !!token], () =>
    getUserInfo(username, token)
  );
}

export function useUserInfo(username: string) {
  const token = useAccessToken();
  return useQuery(["about/user", username, !!token], () => getUserInfo(username, token));
}

const getUserPage = (token?: string) => (username: string, where: string, query: string) => (
  ...args: any
) => {
  const cursor: string = args[args.length - 1] || "";
  let url = `/user/${username}/${where}.json?q=""&raw_json=1${
    cursor ? `&after=${cursor}` : ""
  }&${query}`;
  return fetchAuth(url, token).then(
    (x) =>
      x as {
        kind: "Listing";
        data: { after: Fullname | null; before: Fullname | null; children: UserOverviewResponse[] };
      }
  );
};

export function prefetchUserPage(
  token: string | undefined,
  username: string,
  where: string,
  query: string = ""
) {
  return queryCache.prefetchQuery(["userPage", username, where, query], () =>
    getUserPage(token)(username, where, query)("", "").then((x: any) => [x])
  );
}

export function useUserPage(username: string, where: string, query: string = "") {
  const token = useAccessToken();
  return useInfiniteQuery(
    ["userPage", username, where, query] as any,
    getUserPage(token)(username, where, query),
    {
      getFetchMore,
    }
  );
}
