import {
  queryCache,
  useInfiniteQuery,
  useMutation,
  useQuery,
} from "react-query";
import type { MutationOptions } from "react-query";
import {
  defaultCommentSort,
  Type,
  nove_auth_session_key,
  nove_auth_state_session_key,
} from "../constants";
import { useAccessToken, useIsPending } from "../contexts/authContext";
import { useIsDesktop } from "../contexts/MediaQueryContext";
import type {
  CommentChild,
  CommentSortType,
  CommunityInfoData,
  CommunityRules,
  Fullname,
  ID,
  Link,
  Markdown,
  MeData,
  PostData,
  PostKind,
  Vote,
  PostCommentsData,
} from "../types";
import { fetchJson } from "../utils/fetch";
import { fetchAuth, getFetchMore } from "./common";
import { isCombinedCommunity } from "../utils/isCombinedCommunity";

export function getPostContent(token?: string) {
  return function (postId: string) {
    let pathname = `/api/info.json?id=${Type.Link}_${postId}&raw_json=1`;
    return fetchAuth(pathname, token).then((x) => {
      return x.data.children[0].data as PostData;
    });
  };
}

export function prefetchPostContent(
  token: string | undefined,
  postId: string,
  community?: string
) {
  return queryCache.prefetchQuery(
    ["content", postId, !!token],
    () => getPostContent(token)(postId),
    {
      ...(community && {
        initialData: postContentInitialData(postId, community),
      }),
    }
  );
}

export function usePostContent(postId: string, community?: string) {
  const token = useAccessToken();
  const isPending = useIsPending();
  return useQuery(
    ["content", postId, !!token],
    () => getPostContent(token)(postId),
    {
      ...(community && {
        initialData: postContentInitialData(postId, community),
      }),
      enabled: !isPending,
    }
  );
}

function postContentInitialData(postId: string, community: string) {
  const postListQueries = queryCache.getQueries(["infinitePosts", community]);
  const allQueries = queryCache.getQueries(["infinitePosts"]);
  postListQueries.push(...allQueries);
  for (const query of postListQueries) {
    const data = (query as any).state.data as InfinitePostsResponse[];
    if (data) {
      for (const post of data) {
        const cachedPostContent = post.data.children.find(
          (x: { data: PostData }) => x.data.id === postId
        );
        if (cachedPostContent) {
          return cachedPostContent.data;
        }
      }
    }
  }
}

export function getPostComments(token?: string) {
  return function (
    postId: string,
    community: string,
    sort: CommentSortType,
    query?: string
  ) {
    let pathname = `/r/${community}/comments/${postId}.json`;
    query = query || "";
    pathname = `${pathname}?q=${query}&raw_json=1&sort=${sort}&limit=100`;
    return fetchAuth(pathname, token).then(
      (x) => ({ comments: x[1].data.children } as PostCommentsData)
    );
  };
}

export function usePostComments(
  community: string,
  postId: string,
  sort: CommentSortType,
  query: string
) {
  let token = useAccessToken();
  const isPending = useIsPending();
  return useQuery(
    ["comments", postId, community, sort, query, !!token],
    () => getPostComments(token)(postId, community, sort, query),
    {
      enabled: !isPending,
    }
  );
}

export function prefetchPostComments(
  token: string | undefined,
  postId: string,
  community: string
) {
  return queryCache.prefetchQuery(
    ["comments", postId, community, defaultCommentSort, "", !!token],
    () => getPostComments(token)(postId, community, defaultCommentSort, "")
  );
}

function getCommunityInfo(token?: string) {
  return (community: string) => {
    const pathname = `/r/${community}/about.json?q=""&raw_json=1`;
    return fetchAuth(pathname, token).then(
      (x) => x as { data: CommunityInfoData }
    );
  };
}

export function prefetchCommunityInfo(
  token: string | undefined,
  community: string
) {
  return !isCombinedCommunity(community)
    ? queryCache.prefetchQuery(["about", community, !!token], () =>
        getCommunityInfo(token)(community)
      )
    : noop;
}

export function useCommunityInfo(community: string) {
  const token = useAccessToken();
  const isPending = useIsPending();
  return useQuery(
    ["about", community, !!token],
    () => getCommunityInfo(token)(community),
    { enabled: !isCombinedCommunity(community) && !isPending }
  );
}

function getCommunityRules(community: string) {
  let url = `https://www.reddit.com/r/${community}/about/rules.json?q=""&raw_json=1`;
  return fetchJson(url).then((x) => x.rules as CommunityRules[]);
}

export function prefetchCommunityRules(community: string) {
  return !isCombinedCommunity(community)
    ? queryCache.prefetchQuery(["rules", community], () =>
        getCommunityRules(community)
      )
    : noop;
}

export function useCommunityRules(community: string) {
  return useQuery(["rules", community], () => getCommunityRules(community), {
    enabled: !isCombinedCommunity(community),
  });
}

function getSearchResults(searchTerm: string) {
  let url = `https://www.reddit.com/api/subreddit_autocomplete_v2.json?query=${searchTerm}&raw_json=1`;
  return fetchJson(url)
    .then((x) => x.data.children)
    .then(
      (x) =>
        x.filter((y: any) => y.kind === "t5") as {
          data: CommunityInfoData;
        }[]
    );
}

export function prefetchSearch(searchTerm: string) {
  return searchTerm.trim() !== ""
    ? queryCache.prefetchQuery(["search", searchTerm], (_, searchTerm) =>
        getSearchResults(searchTerm)
      )
    : noop;
}

export function useSearch(searchTerm: string) {
  return useQuery(
    ["search", searchTerm],
    (_, searchTerm) => getSearchResults(searchTerm),
    { suspense: true, enabled: searchTerm.trim() !== "" }
  );
}

type InfinitePostsResponse = {
  kind: "Listing";
  data: {
    children: { data: PostData; kind: Link }[];
    after: Fullname | null;
    before: Fullname | null;
  };
};

const getInfinitePosts = (token?: string) => (
  community: string,
  sort: string,
  query: string
) => (...args: any) => {
  const cursor: string = args[args.length - 1] || "";

  //community === "" is the frontpage
  let url = `${
    community !== "" ? "/r/" : ""
  }${community}/${sort}.json?q=""&raw_json=1${
    cursor ? `&after=${cursor}` : ""
  }${query ? "&" + query : ""}`;
  return fetchAuth(url, token).then((x) => x as InfinitePostsResponse);
};
export function prefetchInfinitePosts(
  token: string | undefined,
  community: string,
  sort: string,
  query: string = ""
) {
  return queryCache.prefetchQuery(
    //@ts-ignore
    ["infinitePosts", community, sort, query, !!token],
    () => getInfinitePosts(token)(community, sort, query)("", ""),
    {
      infinite: true,
    }
  );
}

export function useInfinitePosts(
  community: string,
  sort: string,
  query: string = ""
) {
  const token = useAccessToken();
  const isPending = useIsPending();
  return useInfiniteQuery(
    ["infinitePosts", community, sort, query, !!token],
    getInfinitePosts(token)(community, sort, query),
    {
      getFetchMore,
      enabled: !isPending,
    }
  );
}

export function useLoginUrl() {
  const desktop = useIsDesktop();
  return () => loginUrl(desktop);
}
function loginUrl(desktop: boolean) {
  const authorize = desktop ? "authorize" : "authorize.compact";
  const client_id = process.env.REACT_APP_REDDIT_CLIENT_ID;
  const random_string = Math.random().toString();
  try {
    window.localStorage.setItem(nove_auth_state_session_key, random_string);
  } catch (error) {}
  const redirect_uri = process.env.REACT_APP_REDDIT_REDIRECT_URI;
  const scope =
    "identity, edit, flair, history, mysubreddits, read, save, submit, subscribe, vote";
  const url = `https://www.reddit.com/api/v1/${authorize}?client_id=${client_id}&response_type=code&state=${random_string}&redirect_uri=${redirect_uri}&duration=permanent&scope=${scope}`;
  return url;
}

function getMe(token?: string) {
  return fetchAuth("/api/v1/me", token) as Promise<MeData>;
}

export function useMe() {
  const token = useAccessToken();
  const isPending = useIsPending();
  return useQuery(["me", !!token], () => getMe(token), {
    enabled: !!token && !isPending,
  });
}

function getMyCommunities(token?: string) {
  return fetchJson("https://oauth.reddit.com/subreddits/mine/subscriber", {
    headers: {
      Authorization: `bearer ${token}`,
    },
  }).then((x) =>
    x.data?.children.sort(
      (a: any, b: any) => b.data.subscribers - a.data.subscribers
    )
  ) as Promise<{ data: CommunityInfoData }[]>;
}

export function useMyCommunities() {
  const token = useAccessToken();
  const isPending = useIsPending();
  return useQuery(["myCommunities", !!token], () => getMyCommunities(token), {
    enabled: !!token && !isPending,
  });
}

function vote(token?: string) {
  return ({ dir, id }: { dir: Vote; id: Fullname }) =>
    fetchJson("https://oauth.reddit.com/api/vote", {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `bearer ${token}`,
      },
      method: "post",
      body: `dir=${dir}&id=${id}&rank=2`,
    });
}

export function useVote(
  options?:
    | MutationOptions<
        any,
        {
          dir: Vote;
          id: string;
        }
      >
    | undefined
) {
  const token = useAccessToken();
  return useMutation(vote(token), options);
}

//https://www.reddit.com/dev/api/#GET_api_morechildren
function getMoreChildren(token?: string) {
  return function (
    link_id: Fullname,
    id: ID,
    children: ID[],
    sort: CommentSortType,
    limit_children: boolean
  ) {
    let pathname = `/api/morechildren.json?api_type=json&link_id=${link_id}&id=${id}&sort=${sort}&limit_children=${limit_children}&raw_json=1&children=${children.join(
      ","
    )}`;
    return fetchAuth(pathname, token) as Promise<{
      json: {
        errors: string[];
        data: {
          things: CommentChild[];
        };
      };
    }>;
  };
}

export function useMoreChildren({
  should_fetch,
  id,
  postId,
  children,
  sort,
  limit_children = false,
}: {
  should_fetch: boolean;
  id: ID;
  postId: ID;
  children: ID[];
  sort: CommentSortType;
  limit_children?: boolean;
}) {
  const token = useAccessToken();
  const isPending = useIsPending();
  return useQuery(
    ["morechildren", postId, id, children.join(","), !!token],
    () =>
      getMoreChildren(token)(
        `${Type.Link}_${postId}`,
        id,
        children,
        sort,
        limit_children
      ),
    {
      enabled: should_fetch && !isPending,
    }
  );
}

function submitComment(token?: string) {
  return ({ parent, text }: { text: string; parent: Fullname }) =>
    fetchJson("https://oauth.reddit.com/api/comment", {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `bearer ${token}`,
      },
      method: "post",
      body: `api_type=json&text=${text}&thing_id=${parent}&raw_json=1`,
    });
}

export function useSubmitComment(
  options?:
    | MutationOptions<
        any,
        {
          parent: Fullname;
          text: string;
        }
      >
    | undefined
) {
  const token = useAccessToken();
  return useMutation(submitComment(token), options);
}

function del(token?: string) {
  return (id: Fullname) =>
    fetchJson("https://oauth.reddit.com/api/del", {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `bearer ${token}`,
      },
      method: "post",
      body: `id=${id}`,
    });
}

export function useDelete(options?: MutationOptions<any, Fullname>) {
  const token = useAccessToken();
  return useMutation(del(token), options);
}

function subscribe(token?: string) {
  return ({
    action,
    communities,
  }: {
    action: "sub" | "unsub";
    communities: string[];
  }) =>
    fetchJson("https://oauth.reddit.com/api/subscribe", {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `bearer ${token}`,
      },
      method: "post",
      body: `action=${action}&sr_name=${communities.join(",")}`,
    });
}

export function useSubscribe(
  options?: MutationOptions<
    any,
    { action: "sub" | "unsub"; communities: string[] }
  >
) {
  const token = useAccessToken();
  return useMutation(subscribe(token), options);
}

export { useUserInfo } from "./user";

function edit(token?: string) {
  return ({ id, text }: { id: Fullname; text: string }) =>
    fetchJson("https://oauth.reddit.com/api/editusertext", {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `bearer ${token}`,
      },
      method: "post",
      body: `api_type=json&return_rtjson=true&text=${text}&thing_id=${id}&raw_json=1`,
    });
}

export function useEdit(
  options?: MutationOptions<any, { id: Fullname; text: string }>
) {
  const token = useAccessToken();
  return useMutation(edit(token), options);
}

function submitPost(token?: string) {
  return ({
    kind,
    nsfw,
    text,
    spoiler,
    sr,
    title,
    url,
    video_poster_url,
    flair_id,
    flair_text,
  }: {
    kind: PostKind;
    nsfw: boolean;
    text?: Markdown;
    spoiler: boolean;
    sr: string;
    title: string;
    url?: string;
    video_poster_url?: string;
    flair_id?: number;
    flair_text?: string;
  }) =>
    fetchJson("https://oauth.reddit.com/api/submit", {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `bearer ${token}`,
      },
      method: "post",
      body: new URLSearchParams({
        raw_json: "1",
        resubmit: "true",
        kind: kind as string,
        nsfw: nsfw.toString(),
        ...(text && { text }),
        spoiler: spoiler.toString(),
        sr,
        title,
        ...(url && { url }),
        ...(video_poster_url && { video_poster_url }),
        ...(flair_id && { flair_id: flair_id.toString() }),
        ...(flair_text && { flair_text }),
      }),
    });
}

export function useSubmitPost(
  options?: MutationOptions<
    any,
    {
      kind: PostKind;
      nsfw: boolean;
      text?: Markdown;
      spoiler: boolean;
      sr: string;
      title: string;
      url?: string;
      video_poster_url?: string;
      flair_id?: number;
      flair_text?: string;
    }
  >
) {
  const token = useAccessToken();
  return useMutation(submitPost(token), options);
}

function setToken(token: string) {
  try {
    window.localStorage.setItem(nove_auth_session_key, "true");
  } catch (error) {}
  return fetchJson(`/api/setToken`, {
    method: "post",
    body: new URLSearchParams({
      token,
    }),
  });
}

export function useSetToken() {
  return useMutation(setToken);
}

function deleteToken() {
  return fetchJson(`/api/deleteToken`, {
    method: "post",
  });
}

export function useDeleteToken() {
  return useMutation(deleteToken);
}

export const getToken = () => fetchJson(`/api/getToken`);

function revokeToken({
  token,
  token_type_hint,
}: {
  token: string;
  token_type_hint: "access_token" | "refresh_token";
}) {
  if (token_type_hint === "refresh_token") {
    try {
      window.localStorage.setItem(nove_auth_session_key, "false");
    } catch (error) {}
  }
  return fetchJson("https://www.reddit.com/api/v1/revoke_token", {
    method: "post",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " + btoa(`${process.env.REACT_APP_REDDIT_CLIENT_ID}:`),
    },
    body: new URLSearchParams({
      token,
      token_type_hint,
    }),
  });
}
export function useRevokeToken() {
  return useMutation(revokeToken);
}

function noop() {}
