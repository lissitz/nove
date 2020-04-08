import {
  postSortOptions,
  commentSortOptions,
  defaultPostSort,
  defaultCommentSort,
  userOverviewSortOptions,
  defaultUserOverviewSort,
} from "../constants";

export function parseCommunity(community: string) {
  return community ? community.toLowerCase() : "popular";
}
export function parseSort(sort: string | null) {
  if (!sort || !(postSortOptions as ReadonlyArray<string>).includes(sort)) return defaultPostSort;
  return sort as typeof postSortOptions[number];
}
export function parseCommentSort(sort: string | null) {
  if (!sort || !(commentSortOptions as ReadonlyArray<string>).includes(sort))
    return defaultCommentSort;
  return sort as typeof commentSortOptions[number];
}

export function parseUserOverviewSort(sort: string | null) {
  if (!sort || !(userOverviewSortOptions as ReadonlyArray<string>).includes(sort))
    return defaultUserOverviewSort;
  return sort as typeof userOverviewSortOptions[number];
}
