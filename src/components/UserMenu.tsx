/** @jsx jsx */
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuLink,
  MenuList,
} from "@reach/menu-button";
import VisuallyHidden from "@reach/visually-hidden";
import { alpha } from "@theme-ui/color";
import { Fragment } from "react";
import { FiLogOut, FiSettings, FiUser } from "react-icons/fi";
import { Link } from "react-router-dom";
import { jsx } from "theme-ui";
import { useLogOut } from "../contexts/authContext";
import { useIsDesktop } from "../contexts/MediaQueryContext";
import { useTranslation } from "../i18n";
import rem from "../utils/rem";
import Button from "./Button";
import { Column, Columns } from "./Columns";

export default function UserMenu({
  name,
  pending = false,
}: {
  name: string;
  pending?: boolean;
}) {
  const t = useTranslation();
  const logOut = useLogOut();
  const isDesktop = useIsDesktop();
  return (
    <div
      sx={{
        minWidth: [rem(48), rem(192)],
        height: "100%",
        ml: "auto",
        position: [undefined, "relative"],
        textAlign: "start",
        "[data-reach-menu-popover]": {
          right: 0,
          left: 0,
        },
      }}
      css={`
        :root {
          --reach-menu-button: 1;
        }
        [data-reach-menu],
        [data-reach-menu-popover] {
          display: block;
          position: absolute;
        }

        [data-reach-menu][hidden],
        [data-reach-menu-popover][hidden] {
          display: none;
        }

        [data-reach-menu-list],
        [data-reach-menu-items] {
          outline: none;
        }

        [data-reach-menu-item] {
          display: block;
          user-select: none;
        }

        [data-reach-menu-item] {
          display: block;
          color: inherit;
          font: inherit;
          text-decoration: initial;
        }
        [data-reach-menu-item][data-selected] {
        }
      `}
    >
      <Menu
        sx={{
          position: "relative",
        }}
      >
        <Button
          as={MenuButton}
          disabled={pending}
          sx={{
            textAlign: "center",
            width: "100%",
            background: "transparent",
            height: "100%",
          }}
        >
          {isDesktop ? (
            name
          ) : (
            <Fragment>
              <VisuallyHidden>{name}</VisuallyHidden>
              <FiUser
                aria-hidden
                sx={{
                  width: rem(20),
                  height: rem(20),
                  verticalAlign: "middle",
                }}
              />
            </Fragment>
          )}
        </Button>
        <MenuList
          sx={{
            mt: 1,
            backgroundColor: "surface",
            borderRadius: 4,
            boxShadow: "0 0 8px rgba(0,0,0,0.125)",
            "*": { breakWord: "initial" },
          }}
          portal={false}
        >
          {!isDesktop && (
            <div sx={{ px: [3, null, 2], py: [2, null, 1], borderRadius: 4 }}>
              {name}
            </div>
          )}
          <MenuLink as={Link} sx={menuItemStyles} to={`/u/${name}`}>
            <Columns space={3}>
              <Column sx={{ width: "auto" }}>
                <FiUser
                  aria-hidden
                  sx={{
                    width: rem(20),
                    height: rem(20),
                    verticalAlign: "middle",
                  }}
                />
              </Column>
              <Column>{t("myProfile")}</Column>
            </Columns>
          </MenuLink>
          <MenuLink as={Link} sx={menuItemStyles} to={`/settings`}>
            <Columns space={3}>
              <Column sx={{ width: "auto" }}>
                <FiSettings
                  aria-hidden
                  sx={{
                    width: rem(20),
                    height: rem(20),
                    verticalAlign: "middle",
                  }}
                />
              </Column>
              <Column>{t("appSettings")}</Column>
            </Columns>
          </MenuLink>
          <MenuItem
            sx={menuItemStyles}
            onSelect={() => {
              logOut();
            }}
          >
            <Columns space={3}>
              <Column sx={{ width: "auto" }}>
                <FiLogOut
                  aria-hidden
                  sx={{
                    width: rem(20),
                    height: rem(20),
                    verticalAlign: "middle",
                  }}
                />
              </Column>
              <Column>{t("logOut")}</Column>
            </Columns>
          </MenuItem>
        </MenuList>
      </Menu>
    </div>
  );
}

const menuItemStyles = {
  px: 3,
  py: 2,
  borderRadius: 4,
  "&[data-selected]": {
    outline: "none",
    backgroundColor: alpha("text", 0.1),
  },
  transition: "background-color 0.15s",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: alpha("text", 0.05),
  },
  "&:active": {
    backgroundColor: alpha("text", 0.1),
  },
};
