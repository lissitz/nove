import { fetchJson } from "../utils/fetch";
export function baseUrl(token: string | undefined) {
  return token ? "https://oauth.reddit.com" : "https://www.reddit.com";
}
export const fetchAuth = (pathname: string, token?: string) => {
  return fetchJson(
    `${baseUrl(token)}${pathname}`,
    token
      ? {
          headers: {
            Authorization: `bearer ${token}`,
          },
        }
      : undefined
  );
};
export const getFetchMore = (lastGroup: any, allGroups: any) => {
  return lastGroup.data.after;
};
