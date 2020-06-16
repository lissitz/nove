/** @jsx jsx */
import * as React from "react";
import { jsx } from "theme-ui";
import { useMyCommunities } from "../api";
import { defaultCommunities } from "../constants";
import { useAuth } from "../contexts/authContext";
import { useTranslation } from "../i18n";
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
  const x = useMyCommunities();
  const { data: communities, status } = x;
  const { status: authStatus } = useAuth();
  return (
    <nav sx={{ width: "100%", height: "100%", position: "relative" }}>
      <Stack space={3} sx={{ width: "100%", height: "100%" }}>
        <Stack space={2} sx={{ width: "100%" }}>
          <div sx={{ fontWeight: "600" }}>{t("siteFeeds")}</div>
          <Stack
            as="ul"
            space={2}
            sx={{
              width: "100%",
            }}
          >
            {["popular", "all"]
              .map((x) => ({ name: x }))
              .map((x) => (
                <li
                  key={x.name}
                  sx={{
                    width: "100%",
                  }}
                >
                  <ButtonLink onClick={onClick} to={`/r/${x.name}`}>
                    {x.name}
                  </ButtonLink>
                </li>
              ))}
          </Stack>
        </Stack>
        {authStatus === "pending" || status === "loading" ? (
          <NavPanelSkeleton />
        ) : status === "error" ? null : authStatus === "unitialized" ||
          authStatus === "error" ? (
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
        space={2}
        sx={{
          width: `100%`,
          maxHeight: [null, null, rem(252)], // 7 communities
          overflowY: "auto",
          //firefox
          scrollbarWidth: "thin",
          paddingRight: [null, null, communities.length > 7 ? 2 : 0],
          "&::-webkit-scrollbar": {
            width: 5,
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "textSecondary",
            borderRadius: 4,
          },
          "&::-webkit-scrollbar-track": {
            borderRadius: 4,
            bg: "rgba(0, 0, 0, 0.1)",
          },
        }}
      >
        {communities.map((x) => (
          <li
            key={x}
            sx={{
              width: "100%",
            }}
          >
            <ButtonLink onClick={onClick} to={`/r/${x}`}>{`r/${x}`}</ButtonLink>
          </li>
        ))}
      </Stack>
    </Stack>
  );
}

function noop() {}
