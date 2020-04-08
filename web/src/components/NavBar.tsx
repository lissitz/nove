/** @jsx jsx */
import { jsx } from "theme-ui";
import { useLoginUrl, useMe } from "../api";
import { useAuthStatus } from "../contexts/authContext";
import { useTranslation } from "../i18n";
import { maxWidth } from "../styles/base";
import { Column, Columns } from "./Columns";
import ButtonLink from "./ButtonLink";
import { callToActionStyles } from "./Button";
import Link from "./Link";
import rem from "../utils/rem";
import Search from "./Search";
import { headerHeight } from "../constants";
import UserMenu from "./UserMenu";
import Drawer from "./Drawer";
import ThemeListbox from "./ThemeListbox";
import { useIsDesktop } from "../contexts/MediaQueryContext";

export default function NavBar({ children }: { children?: React.ReactNode }) {
  const t = useTranslation();
  const authStatus = useAuthStatus();
  const { data: me, status } = useMe();
  const loginUrl = useLoginUrl();
  const isDesktop = useIsDesktop();
  return (
    <header
      sx={{
        width: "100%",
        height: rem(headerHeight),
      }}
    >
      <div
        sx={{
          position: "fixed",
          width: "100%",
          height: rem(headerHeight),
          backgroundColor: "surface",
          boxShadow: "0px 0px 0px 1px  rgba(0, 0, 0, 0.1) ,  0px 1px 3px  rgba(0, 0, 0, 0.1)",
          zIndex: 1000,
        }}
      >
        <div
          sx={{
            maxWidth,
            margin: "0 auto",
            height: "100%",
          }}
        >
          <Columns space={3} sx={{ height: "100%", alignItems: "center", px: 2 }}>
            <Column sx={{ flex: "0 0 auto", width: ["auto", null, rem(192)] }}>
              {isDesktop ? (
                <div
                  sx={{
                    display: "flex",
                    height: "100%",
                    alignItems: "center",
                  }}
                >
                  <h1 sx={{ fontSize: 4 }}>
                    <Link to="/" sx={{ ":hover": { textDecoration: "none" } }}>
                      Nove
                    </Link>
                  </h1>
                </div>
              ) : (
                <Drawer>{children}</Drawer>
              )}
            </Column>
            <Column sx={{ flex: "1 1 auto" }}>
              <Search />
            </Column>
            <Column
              sx={{
                flex: "1 0 auto",
                width: ["auto", null, rem(300)],
                textAlign: "right",
                ">*": {
                  display: "flex",
                  alignItems: "center",
                },
              }}
            >
              <Columns space={3} sx={{ width: "100%" }}>
                <Column
                  sx={{
                    width: "auto",
                  }}
                >
                  <div
                    sx={{
                      width: rem(48),
                      height: rem(48),
                    }}
                  >
                    <ThemeListbox />
                  </div>
                </Column>
                <Column sx={{ marginLeft: "auto" }}>
                  <div sx={{ display: "flex", alignItems: "center", height: "100%" }}>
                    {authStatus === "success" ? (
                      status === "success" && me ? (
                        <UserMenu name={me.name} />
                      ) : null
                    ) : authStatus === "pending" || status === "loading" ? null : (
                      <ButtonLink
                        external
                        to={loginUrl}
                        sx={{
                          marginLeft: "auto",
                          wordBreak: "normal",
                          ...callToActionStyles,
                          display: "inline-block",
                        }}
                      >
                        {t("login")}
                      </ButtonLink>
                    )}
                  </div>
                </Column>
              </Columns>
            </Column>
          </Columns>
        </div>
      </div>
    </header>
  );
}
