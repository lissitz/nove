export const Type = {
  Comment: "t1",
  Account: "t2",
  Link: "t3",
  Message: "t4",
  Subreddit: "t5",
  Award: "t6",
} as const;

export const commentSortOptions = [
  "new",
  "best",
  "top",
  "controversial",
  "old",
  "qa",
] as const;

export const defaultCommentSort = "best";

export const postSortOptions = ["hot", "new", "top"] as const;
export const defaultPostSort = "hot";

export const userOverviewSortOptions = ["hot", "new", "top"] as const;
export const defaultUserOverviewSort = "hot";

export const headerHeight = 48;

export const defaultUserWhere = "overview";

export const defaultCommunities = [
  "announcements",
  "Art",
  "AskReddit",
  "askscience",
  "aww",
  "blog",
  "books",
  "creepy",
  "dataisbeautiful",
  "DIY",
  "Documentaries",
  "EarthPorn",
  "explainlikeimfive",
  "food",
  "funny",
  "Futurology",
  "gadgets",
  "gaming",
  "GetMotivated",
  "gifs",
  "history",
  "IAmA",
  "InternetIsBeautiful",
  "Jokes",
  "LifeProTips",
  "listentothis",
  "mildlyinteresting",
  "movies",
  "Music",
  "news",
  "nosleep",
  "nottheonion",
  "OldSchoolCool",
  "personalfinance",
  "philosophy",
  "photoshopbattles",
  "pics",
  "science",
  "Showerthoughts",
  "space",
  "sports",
  "television",
  "tifu",
  "todayilearned",
  "UpliftingNews",
  "videos",
  "worldnews",
];

export const postKind = ["self", "link", "image", "video", "videogif"] as const;

export const allowEmbeds = true;

export const themes = ["default", "deep"] as const;

export const nove_auth_session_key = "nove_auth";
export const nove_auth_state_session_key = "nove_auth_state";
