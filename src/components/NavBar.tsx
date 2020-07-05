/** @jsx jsx */
import { jsx } from "theme-ui";
import { useLoginUrl, useMe } from "../api";
import { headerHeight } from "../constants";
import { useIsAuthenticated, useIsPending } from "../contexts/authContext";
import { useIsDesktop } from "../contexts/MediaQueryContext";
import { useTranslation } from "../i18n";
import { maxWidth } from "../styles/base";
import rem from "../utils/rem";
import { callToActionStyles } from "./Button";
import ButtonLink from "./ButtonLink";
import { Column, Columns } from "./Columns";
import Drawer from "./Drawer";
import Link from "./Link";
import Search from "./Search";
import ThemeListbox from "./ThemeListbox";
import UserMenu from "./UserMenu";

export default function NavBar({ children }: { children?: React.ReactNode }) {
  const t = useTranslation();
  const isAuthenticated = useIsAuthenticated();
  const isPending = useIsPending();
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
          boxShadow:
            "0px 0px 0px 1px  rgba(0, 0, 0, 0.1) ,  0px 1px 3px  rgba(0, 0, 0, 0.1)",
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
          <Columns
            space={3}
            sx={{ height: "100%", alignItems: "center", px: 2 }}
          >
            <Column sx={{ flex: "0 0 auto", width: ["auto", null, rem(192)] }}>
              {isDesktop ? (
                <div
                  sx={{
                    display: "flex",
                    height: "100%",
                    alignItems: "center",
                  }}
                >
                  <div sx={{ fontSize: 4 }}>
                    <Link to="/" sx={{ ":hover": { textDecoration: "none" } }}>
                      Nove
                    </Link>
                  </div>
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
                  <div
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    {isAuthenticated ? (
                      status === "success" && me ? (
                        <UserMenu name={me.name} />
                      ) : null
                    ) : isPending ? null : (
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
