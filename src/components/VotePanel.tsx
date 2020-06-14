/** @jsx jsx */
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { queryCache } from "react-query";
import { jsx } from "theme-ui";
import { useLoginUrl, useVote } from "../api";
import { Type } from "../constants";
import { useAuthStatus } from "../contexts/authContext";
import { useTranslation } from "../i18n";
import { ID, PostSortType, Vote } from "../types";
import { formatQuantity } from "../utils/format";
import Button from "./Button";
import Stack from "./Stack";
import Tooltip from "./Tooltip";
import VisuallyHidden from "@reach/visually-hidden";

export default function VotePanel({
  postId,
  score,
  vote: postVote,
  community,
  sort,
  query,
}: {
  postId: ID;
  score?: number;
  vote: Vote;
  community: string;
  sort?: PostSortType;
  query: string;
}) {
  const t = useTranslation();
  const authStatus = useAuthStatus();
  const [vote, setVote] = useState(postVote);
  const mounted = useRef(true);
  const loginUrl = useLoginUrl();
  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);
  const [mutate] = useVote({
    onMutate: (mutationVariables) => {
      mounted.current && setVote(mutationVariables.dir);
      return () => setVote(mutationVariables.dir);
    },
    onSuccess: (_data, mutationVariables) => {
      mounted.current && setVote(mutationVariables.dir);
      queryCache.refetchQueries([postId]);
      sort && queryCache.refetchQueries(["infinitePosts", community, sort, query]);
    },
    onError: (_data, mutationVariables, rollback) => {
      //@ts-ignore
      mounted.current && rollback();
    },
  });
  const sendVote = useCallback(
    (dir: 1 | 0 | -1) =>
      authStatus === "success"
        ? () => {
            mutate({
              dir,
              id: `${Type.Link}_${postId}`,
            });
          }
        : () => {
            window.location.href = loginUrl;
          },
    [authStatus, mutate, postId, loginUrl]
  );
  return (
    <Stack space={1} align="center">
      <CondTooltip cond={authStatus !== "success"} label={t("loginToVote")}>
        <div>
          <VoteButton onClick={sendVote(vote === 1 ? 0 : 1)} selected={vote === 1}>
            <VisuallyHidden>{t("upvote")}</VisuallyHidden>
            <FiChevronUp aria-hidden />
          </VoteButton>
        </div>
      </CondTooltip>
      <div sx={{ textAlign: "center" }}>{score && formatQuantity(score, t)}</div>
      <CondTooltip cond={authStatus !== "success"} label={t("loginToVote")}>
        <div>
          <VoteButton onClick={sendVote(vote === -1 ? 0 : -1)} selected={vote === -1}>
            <VisuallyHidden>{t("downvote")}</VisuallyHidden>
            <FiChevronDown aria-hidden />
          </VoteButton>
        </div>
      </CondTooltip>
    </Stack>
  );
}

function CondTooltip({
  cond,
  children,
  label,
  ...rest
}: {
  cond: boolean;
  children: React.ReactNode;
  label: React.ComponentProps<typeof Tooltip>["label"];
  rest?: Omit<React.ComponentProps<typeof Tooltip>, "children">;
}) {
  return cond ? (
    <Tooltip label={label} {...rest}>
      {children}
    </Tooltip>
  ) : (
    <Fragment>{children} </Fragment>
  );
}

function VoteButton({
  children,
  selected,
  onClick,
}: {
  children: React.ReactNode;
  selected: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <Button
      variant="secondary"
      sx={{
        color: "textSecondary",
        "&:after": {
          opacity: selected ? "0.1 !important" : 0,
        },
        bg: "transparent",
        ">*": { verticalAlign: "middle" },
      }}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}