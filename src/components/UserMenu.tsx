/** @jsx jsx */
import { Menu, MenuButton, MenuItem, MenuLink, MenuList } from "@reach/menu-button";
import { alpha } from "@theme-ui/color";
import { Link } from "react-router-dom";
import { jsx } from "theme-ui";
import { useLogOut } from "../contexts/authContext";
import { useTranslation } from "../i18n";
import rem from "../utils/rem";
import Button from "./Button";

export default function UserMenu({ name }: { name: string }) {
  const t = useTranslation();
  const logOut = useLogOut();
  return (
    <div
      sx={{
        width: rem(128),
        height: "100%",
        ml: "auto",
        position: "relative",
        textAlign: "start",
      }}
      css={`
        :root {
          --reach-menu-button: 1;
        }
        [data-reach-menu],
        [data-reach-menu-popover] {
          display: block;
          position: absolute;
          width: 100%;
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
          sx={{
            textAlign: "center",
            width: "100%",
            background: "transparent",
            height: "100%",
          }}
        >
          {name}
        </Button>
        <MenuList
          sx={{
            mt: 1,
            backgroundColor: "surface",
            borderRadius: 4,
            boxShadow: "0 0 8px rgba(0,0,0,0.125)",
          }}
          portal={false}
        >
          <MenuLink as={Link} sx={menuItemStyles} to={`/u/${name}`}>
            {t("myProfile")}
          </MenuLink>
          <MenuItem
            sx={menuItemStyles}
            onSelect={() => {
              logOut();
            }}
          >
            {t("logOut")}
          </MenuItem>
        </MenuList>
      </Menu>
    </div>
  );
}

const menuItemStyles = {
  px: 2,
  py: 1,
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