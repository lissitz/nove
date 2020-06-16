import {
  queryCache,
  useInfiniteQuery,
  useMutation,
  useQuery,
} from "react-query";
import type { MutationOptions } from "react-query";
import { defaultCommentSort, Type } from "../constants";
import { useAccessToken } from "../contexts/authContext";
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
} from "../types";
import { fetchJson } from "../utils/fetch";
import { fetchAuth, getFetchMore } from "./common";

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
    ["content", postId],
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
  return useQuery(["content", postId], () => getPostContent(token)(postId), {
    ...(community && {
      initialData: postContentInitialData(postId, community),
    }),
  });
}

function postContentInitialData(postId: string, community: string) {
  const postListQueries = queryCache.getQueries(["infinitePosts", community]);
  const siteFeedQueries = [
    queryCache.getQueries(["infinitePosts", "popular"]),
    queryCache.getQueries(["infinitePosts", "all"]),
  ];
  for (const queries of siteFeedQueries) {
    if (queries) postListQueries.push(...queries);
  }
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
    pathname = `${pathname}?q=${query}&raw_json=1&sort=${sort}`;
    return fetchAuth(pathname, token).then(
      (x) =>
        ({ comments: x[1].data.children } as {
          comments: CommentChild[];
        })
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
  return useQuery(["comments", postId, community, sort, query], () =>
    getPostComments(token)(postId, community, sort, query)
  );
}

export function prefetchPostComments(
  token: string | undefined,
  postId: string,
  community: string
) {
  return queryCache.prefetchQuery(
    ["comments", postId, community, defaultCommentSort, ""],
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
  return queryCache.prefetchQuery(
    !(community === "all" || community === "popular") && ["about", community],
    () => getCommunityInfo(token)(community)
  );
}

export function useCommunityInfo(community: string) {
  const token = useAccessToken();
  return useQuery(
    !(community === "all" || community === "popular") && ["about", community],
    () => getCommunityInfo(token)(community),
    { suspense: true }
  );
}

function getCommunityRules(community: string) {
  let url = `https://www.reddit.com/r/${community}/about/rules.json?q=""&raw_json=1`;
  return fetchJson(url).then((x) => x.rules as CommunityRules[]);
}

export function prefetchCommunityRules(community: string) {
  return queryCache.prefetchQuery(
    !(community === "all" || community === "popular") && ["rules", community],
    () => getCommunityRules(community)
  );
}

export function useCommunityRules(community: string) {
  return useQuery(
    !(community === "all" || community === "popular") && ["rules", community],
    () => getCommunityRules(community)
  );
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
  return queryCache.prefetchQuery(
    //@ts-ignore
    searchTerm.trim() !== "" && ["search", searchTerm],
    (_, searchTerm) => getSearchResults(searchTerm)
  );
}

export function useSearch(searchTerm: string) {
  return useQuery(
    //@ts-ignore
    searchTerm.trim() !== "" && ["search", searchTerm],
    (_, searchTerm) => getSearchResults(searchTerm),
    { suspense: true }
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
  let url = `/r/${community}/${sort}.json?q=""&raw_json=1${
    cursor ? `&after=${cursor}` : ""
  }&${query}`;
  return fetchAuth(url, token).then((x) => x as InfinitePostsResponse);
};
export function prefetchInfinitePosts(
  token: string | undefined,
  community: string,
  sort: string,
  query: string = ""
) {
  return queryCache.prefetchQuery(
    ["infinitePosts", community, sort, query],
    () =>
      getInfinitePosts(token)(
        community,
        sort,
        query
      )("", "").then((x: any) => [x])
  );
}

export function useInfinitePosts(
  community: string,
  sort: string,
  query: string = ""
) {
  const token = useAccessToken();
  return useInfiniteQuery(
    ["infinitePosts", community, sort, query] as any,
    getInfinitePosts(token)(community, sort, query),
    {
      getFetchMore,
      suspense: true,
    }
  );
}

export function useLoginUrl() {
  const desktop = useIsDesktop();
  return loginUrl(desktop);
}
function loginUrl(desktop: boolean) {
  const authorize = desktop ? "authorize" : "authorize.compact";
  const client_id = process.env.REACT_APP_REDDIT_CLIENT_ID;
  const random_string = Math.random().toString();
  const redirect_uri = process.env.REACT_APP_REDDIT_REDIRECT_URI;
  const scope =
    "identity, edit, flair, history, modconfig, modflair, modlog, modposts, modwiki, mysubreddits, privatemessages, read, report, save, submit, subscribe, vote, wikiedit, wikiread";
  const url = `https://www.reddit.com/api/v1/${authorize}?client_id=${client_id}&response_type=code&state=${random_string}&redirect_uri=${redirect_uri}&duration=permanent&scope=${scope}`;
  return url;
}

function getMe(token?: string) {
  return fetchAuth("/api/v1/me", token) as Promise<MeData>;
}

export function useMe() {
  const token = useAccessToken();
  return useQuery(token && "me", () => getMe(token));
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
  return useQuery(token && "myCommunities", () => getMyCommunities(token));
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
    children: ID[],
    sort: CommentSortType,
    limit_children: boolean
  ) {
    let pathname = `/api/morechildren.json?api_type=json&children=${children.join(
      ","
    )}&link_id=${link_id}&sort=${sort}&limit_children=${limit_children}&raw_json=1`;
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
  postId,
  children,
  sort,
  limit_children = true,
}: {
  should_fetch: boolean;
  postId: ID;
  children: ID[];
  sort: CommentSortType;
  limit_children?: boolean;
}) {
  const token = useAccessToken();
  return useQuery(
    should_fetch && ["morechildren", postId, children.join(",")],
    () =>
      getMoreChildren(token)(
        `${Type.Link}_${postId}`,
        children,
        sort,
        limit_children
      )
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
