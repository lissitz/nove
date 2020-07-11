/** @jsx jsx */
import VisuallyHidden from "@reach/visually-hidden";
import {
  Fragment,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { queryCache } from "react-query";
import { jsx } from "theme-ui";
import { useLoginUrl, useVote } from "../api";
import { Type } from "../constants";
import { useBreakpoint } from "../contexts/MediaQueryContext";
import { useFormat, useTranslation } from "../i18n";
import { ID, Vote } from "../types";
import Button from "./Button";
import { Column, Columns } from "./Columns";
import Stack from "./Stack";
import Tooltip from "./Tooltip";
import { useIsAuthenticated } from "../contexts/authContext";

type VoteState = { vote: Vote; score: number | undefined };
type VoteAction = { dir: Vote };

function reducer({ score, vote }: VoteState, { dir }: VoteAction): VoteState {
  return {
    score: score != null ? score + (dir - vote) : undefined,
    vote: dir,
  };
}

export default function VotePanel({
  postId,
  score: initialScore,
  vote: postVote,
  community,
}: {
  postId: ID;
  score?: number;
  vote: Vote;
  community: string;
}) {
  const t = useTranslation();
  const format = useFormat();
  const isAuthenticated = useIsAuthenticated();
  const [vote, setVote] = useState(postVote);
  const [{ score }, setScore] = useReducer(reducer, {
    score: initialScore,
    vote,
  });

  const mounted = useRef(true);
  const loginUrl = useLoginUrl();
  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);
  const [mutate] = useVote({
    onMutate: (mutationVariables) => {
      mounted.current && setScore({ dir: mutationVariables.dir });
      mounted.current && setVote(mutationVariables.dir);
    },
    onSuccess: (_data, mutationVariables) => {
      mounted.current && setScore({ dir: mutationVariables.dir });
      mounted.current && setVote(mutationVariables.dir);
      queryCache.invalidateQueries([postId]);
      queryCache.invalidateQueries(["infinitePosts", community]);
    },
  });
  const sendVote = useCallback(
    (dir: 1 | 0 | -1) =>
      isAuthenticated
        ? () => {
            mutate({
              dir,
              id: `${Type.Link}_${postId}`,
            });
          }
        : () => {
            window.location.href = loginUrl();
          },
    [isAuthenticated, mutate, postId, loginUrl]
  );
  const breakpoint = useBreakpoint();
  const mobile = breakpoint === "mobile";
  const upvote = (
    <CondTooltip cond={!isAuthenticated} label={t("loginToVote")}>
      <div>
        <VoteButton
          onClick={sendVote(vote === 1 ? 0 : 1)}
          selected={vote === 1}
        >
          <VisuallyHidden>{t("upvote")}</VisuallyHidden>
          <FiChevronUp aria-hidden />
        </VoteButton>
      </div>
    </CondTooltip>
  );
  const scorePanel = (
    <div
      sx={{
        textAlign: "center",
        wordBreak: "initial",
      }}
    >
      {score && format.quantity(score, t)}
    </div>
  );
  const downvote = (
    <CondTooltip cond={!isAuthenticated} label={t("loginToVote")}>
      <div>
        <VoteButton
          onClick={sendVote(vote === -1 ? 0 : -1)}
          selected={vote === -1}
        >
          <VisuallyHidden>{t("downvote")}</VisuallyHidden>
          <FiChevronDown aria-hidden />
        </VoteButton>
      </div>
    </CondTooltip>
  );
  return mobile ? (
    <Columns space={2}>
      <Column>{upvote}</Column>
      <Column>
        <div
          sx={{
            height: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          {scorePanel}
        </div>
      </Column>
      <Column>{downvote}</Column>
    </Columns>
  ) : (
    <Stack space={1} align="center">
      {upvote}
      {scorePanel}
      {downvote}
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
