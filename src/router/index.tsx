/** @jsx jsx */
import { useCallback } from "react";
import { NavigateFunction, Params } from "react-router";
import {
  matchRoutes,
  useLocation,
  useNavigate as RRuseNavigate,
  useRoutes,
} from "react-router-dom";
import { jsx } from "theme-ui";
import {
  prefetchCommunityInfo,
  prefetchCommunityRules,
  prefetchInfinitePosts,
  prefetchPostComments,
  prefetchPostContent,
} from "../api";
import { prefetchUserInfo, prefetchUserPage } from "../api/user";
import { defaultPostSort, defaultUserWhere } from "../constants";
import {
  AuthStatus,
  useAccessToken,
  useAuthStatus,
} from "../contexts/authContext";
import { useDispatchScroll } from "../contexts/scrollContext";
import Comments from "../pages/Comments";
import Community from "../pages/Community";
import CommunityBase from "../pages/CommunityBase";
import SubmitPost from "../pages/SubmitPost";
import User from "../pages/User";
import { parseCommunity } from "../utils/params";
import { isCombinedCommunity } from "../utils/isCombinedCommunity";

export const routes = (authStatus: AuthStatus, token: string) => {
  const community = {
    element: <Community />,
    caseSensitive: false,
    preload: (params: Params) => {
      const community = parseCommunity(params.community);
      if (community !== "") {
        prefetchCommunityInfo(token, community);
        prefetchCommunityRules(community);
      }
      prefetchInfinitePosts(token, community, defaultPostSort);
    },
  };
  const comments = {
    element: <Comments />,
    caseSensitive: false,
    preload: (params: Params) => {
      let { community, postId } = params;
      community = community.toLowerCase();
      prefetchPostContent(
        token,
        postId,
        isCombinedCommunity(community) ? undefined : community
      );
      prefetchPostComments(token, postId, community);
      prefetchCommunityInfo(token, community);
      prefetchCommunityRules(community);
    },
  };
  const submit = {
    element: <SubmitPost />,
    caseSensitive: false,
  };
  const user = {
    element: <User />,
    caseSensitive: false,
    preload: (params: Params) => {
      prefetchUserPage(
        token,
        params.username,
        params.where || defaultUserWhere
      );
      prefetchUserInfo(token, params.username);
    },
  };
  return [
    {
      path: "*",
      element: <CommunityBase />,
      children: [{ path: "*", ...community }],
      caseSensitive: false,
    },
    {
      path: "/:sort",
      element: <CommunityBase />,
      children: [{ path: "/", ...community }],
      caseSensitive: false,
    },

    {
      path: "/r/:community",
      element: <CommunityBase />,
      caseSensitive: false,
      children: [
        {
          path: "/",
          ...community,
        },
        { path: ":sort", ...community },
        { path: "comments/:postId", ...comments },
        { path: "comments/:postId/:title", ...comments },
        ...(authStatus === "success" ? [{ path: "submit", ...submit }] : []),
      ],
    },

    { path: "u/:username", ...user },
    { path: "u/:username/:where", ...user },
  ];
};
export default function Router() {
  //useManageScrollOnRouteChange();
  const token = useAccessToken();
  const authStatus = useAuthStatus();
  return useRoutes(routes(authStatus, token || ""));
}

export function usePreload() {
  const token = useAccessToken();
  const authStatus = useAuthStatus();
  return function (to: string) {
    const matches = matchRoutes(routes(authStatus, token || ""), to);
    if (matches) {
      matches.forEach(
        ({ route, params }: any, index: any) =>
          //@ts-ignore
          route.preload && route.preload(params)
      );
    }
  };
}

export function useNavigate(): NavigateFunction {
  const dispatch = useDispatchScroll();
  const location = useLocation();
  const navigate = RRuseNavigate();
  const n = useCallback(
    (...args: any) => {
      dispatch({ [location.key]: { x: window.scrollX, y: window.scrollY } });
      //@ts-ignore
      navigate(...args);
    },
    [navigate, dispatch, location]
  );
  return n;
}
