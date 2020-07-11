import {
  commentSortOptions,
  postSortOptions,
  userOverviewSortOptions,
  postKind,
  themes,
} from "./constants";
export type Comment = "t1";
export type Account = "t2";
export type Link = "t3";
export type Message = "t4";
export type Subreddit = "t5";
export type Award = "t6";

export type Fullname = string;
export type ID = string;
export type RawHTML = string;
export type Markdown = string;
export type URL = string;

export type ThingType = Comment | Account | Link | Message | Subreddit | Award;
export type PostData = {
  id: ID;
  title: string;
  permalink: string;
  url: string;
  thumbnail: string;
  is_self: boolean;
  selftext: string;
  selftext_html: RawHTML;
  author: string;
  created_utc: string;
  num_comments: number;
  ups: number;
  downs: number;
  likes: boolean | null;
  score?: number;
  distinguished: UserType;
  link_flair_background_color: string;
  link_flair_text: string;
  link_flair_text_color: "light" | "dark";
  subreddit: string;
  post_hint?: "hosted:video" | "rich:video" | "link" | "self";
  is_video: boolean;
  domain: string;
  thumbnail_width: number | null;
  thumbnail_height: number | null;
  secure_media: any;
  archived: boolean;
  name: Fullname;
  preview?: {
    images: {
      source: { width: number; height: number };
      resolutions: { width: number; height: number; url: URL }[];
    }[];
  };
};

export type ResponseItem<T, U> = { kind: T; data: U };

export type PostSortType = typeof postSortOptions[number];

export type UserType = "admin" | "special" | "moderator" | null;
export type CommentData = {
  id: string;
  body_html: RawHTML;
  body: Markdown;
  author: string;
  name: Fullname;
  score?: number;
  created_utc: string;
  is_submitter: boolean;
  subreddit: string;
  distinguished: UserType;
  stickied: boolean;
  link_id: Fullname;
  likes: boolean | null;
  link_title: string;
  parent_id: Fullname;
  locked: boolean;
  //not sure what "" vs undefined represents
  replies?:
    | ""
    | {
        data: {
          children: CommentChild[];
        };
      };
  archived: boolean;
  edited: false | number;
};

export type CommentChild =
  | { kind: Comment; data: CommentData }
  | { kind: "more"; data: MoreChildrenData };

export type MoreChildrenData = {
  children: ID[];
  count: number;
  depth: number;
  id: ID;
  name: Fullname;
  parent_id: Fullname;
};

export type PostCommentsData = {
  comments: CommentChild[];
};

export type CommentSortType = typeof commentSortOptions[number];

export type CommunityInfoData = {
  submit_text_html: RawHTML;
  header_img: string;
  title: string;
  active_user_count: number;
  icon_img: string;
  subscribers: number;
  community_icon: string;
  description_html: RawHTML;
  banner_background_color: string;
  id: string;
  public_description_html: RawHTML;
  display_name: string;
  primary_color: string;
  key_color: string;
  url: string;
  created_utc: number;
  user_is_subscriber: boolean;
};

export type CommunityRules = {
  created_utc: number;
  description_html: RawHTML;
  kind: "all" | "link";
  priority: number;
  short_name: string;
  violation_reason: string;
};

export type MeData = {
  name: string;
};

export type Vote = 1 | 0 | -1;
export type VotePostData = {
  dir: Vote;
  id: Fullname;
  rank: number;
};

export type UserInfo = {
  name: string;
  link_karma: number;
  comment_karma: number;
  id: string;
  created_utc: number;
};

export type UserOverviewSortType = typeof userOverviewSortOptions[number];
export type OverviewData = CommentData | PostData;

export type UserOverviewResponse =
  | { data: PostData; kind: Link }
  | { data: CommentData; kind: Comment };

export type PostKind = typeof postKind[number];

export type Themes = typeof themes[number];
