/** @jsx jsx */
import * as React from "react";
import { jsx } from "theme-ui";
import { useMyCommunities } from "../api";
import { defaultCommunities } from "../constants";
import { useIsAuthenticated, useIsPending } from "../contexts/authContext";
import { useTranslation } from "../i18n";
import { scrollbar } from "../theme/theme";
import rem from "../utils/rem";
import ButtonLink from "./ButtonLink";
import NavPanelSkeleton from "./NavPanelSkeleton";
import Stack from "./Stack";

export default function NavPanel({
  sortMenu,
  onClick = noop,
}: {
  sortMenu: React.ReactNode;
  onClick?: (event: MouseEvent) => void;
}) {
  const t = useTranslation();
  const { data: communities, status } = useMyCommunities();
  const isAuthenticated = useIsAuthenticated();
  const isPending = useIsPending();
  return (
    <nav sx={{ width: "100%", height: "100%", position: "relative" }}>
      <Stack space={3} sx={{ width: "100%", height: "100%" }}>
        <Stack space={2} sx={{ width: "100%" }}>
          <div sx={{ fontWeight: "600" }}>{t("siteFeeds")}</div>
          <Stack
            as="ul"
            asChild="li"
            space={2}
            sx={{
              width: "100%",
            }}
          >
            {["popular", "all"].map((x) => (
              <div
                key={x}
                sx={{
                  width: "100%",
                }}
              >
                <ButtonLink onClick={onClick} to={`/r/${x}`}>
                  {x}
                </ButtonLink>
              </div>
            ))}
          </Stack>
        </Stack>
        {isPending || status === "loading" ? (
          <NavPanelSkeleton />
        ) : status === "error" ? null : !isAuthenticated ? (
          <MyCommunities communities={defaultCommunities} onClick={onClick} />
        ) : (
          communities &&
          communities.length > 0 && (
            <MyCommunities
              onClick={onClick}
              isAuthenticated
              communities={communities.map((x) => x.data.display_name)}
            />
          )
        )}
        {sortMenu}
      </Stack>
    </nav>
  );
}

function MyCommunities({
  communities,
  isAuthenticated,
  onClick = noop,
}: {
  communities: string[];
  isAuthenticated?: boolean;
  onClick: (event: MouseEvent) => void;
}) {
  const t = useTranslation();
  return (
    <Stack space={2} sx={{ width: "100%" }}>
      <div sx={{ fontWeight: "600" }}>
        {isAuthenticated ? t("myCommunities") : t("communities")}
      </div>
      <Stack
        as="ul"
        asChild="li"
        space={2}
        sx={{
          width: `100%`,
          maxHeight: [null, null, rem(252)], // 7 communities
          paddingRight: [null, null, communities.length > 7 ? 2 : 0],
          overflowY: "auto",
          ...scrollbar,
        }}
      >
        {communities.map((x) => (
          <div
            key={x}
            sx={{
              width: "100%",
            }}
          >
            <ButtonLink onClick={onClick} to={`/r/${x}`}>{`r/${x}`}</ButtonLink>
          </div>
        ))}
      </Stack>
    </Stack>
  );
}

function noop() {}
