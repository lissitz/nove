/** @jsx jsx */
import VisuallyHidden from "@reach/visually-hidden";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { jsx } from "theme-ui";
import { useLoginUrl, useVote } from "../api";
import { useAuthStatus } from "../contexts/authContext";
import { useTranslation } from "../i18n";
import { Fullname, Vote } from "../types";
import Button from "./Button";
import Tooltip from "./Tooltip";

export default function CommentVotePanel({
  name,
  setScore,
  vote: initialVote,
}: {
  name: Fullname;
  setScore: Function;
  vote: Vote;
}) {
  const t = useTranslation();
  const authStatus = useAuthStatus();
  const [vote, setVote] = useState(initialVote);
  const mounted = useRef(true);
  const loginUrl = useLoginUrl();
  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);
  const [mutate] = useVote({
    onMutate: (mutationVariables) => {
      //we mutate state instead of refetching as refetching would change the score of all posts and appear strange to the user
      mounted.current && setScore({ dir: mutationVariables.dir });
      mounted.current && setVote(mutationVariables.dir);
    },
    onSuccess: (_data, mutationVariables) => {
      mounted.current && setScore({ dir: mutationVariables.dir });
      mounted.current && setVote(mutationVariables.dir);
    },
  });
  const sendVote = useCallback(
    (dir: 1 | 0 | -1) =>
      authStatus === "success"
        ? () => {
            mutate({
              dir,
              id: name,
            });
          }
        : () => {
            window.location.href = loginUrl;
          },
    [authStatus, mutate, name, loginUrl]
  );
  return (
    <Fragment>
      <CondTooltip cond={authStatus !== "success"} label={t("loginToVote")}>
        <div sx={{ display: "inline" }}>
          <VoteButton
            onClick={sendVote(vote === 1 ? 0 : 1)}
            selected={vote === 1}
          >
            <VisuallyHidden>{t("upvote")}</VisuallyHidden>
            <FiChevronUp aria-hidden />
          </VoteButton>
        </div>
      </CondTooltip>
      <CondTooltip cond={authStatus !== "success"} label={t("loginToVote")}>
        <div sx={{ display: "inline" }}>
          <VoteButton
            onClick={sendVote(vote === -1 ? 0 : -1)}
            selected={vote === -1}
          >
            <VisuallyHidden>{t("downvote")}</VisuallyHidden>
            <FiChevronDown aria-hidden />
          </VoteButton>
        </div>
      </CondTooltip>
    </Fragment>
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
        display: "inline",
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
