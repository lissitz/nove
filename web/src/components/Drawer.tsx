/** @jsx jsx */
import { css, Global } from "@emotion/core";
import { DialogContent, DialogOverlay } from "@reach/dialog";
import VisuallyHidden from "@reach/visually-hidden";
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { jsx, useColorMode } from "theme-ui";
import { useTranslation } from "../i18n";
import rem from "../utils/rem";
import Button from "./Button";
import NavPanel from "./NavPanel";
import Stack from "./Stack";

export default function Drawer({ children }: { children?: React.ReactNode }) {
  const t = useTranslation();
  //@ts-ignore
  const [isOpen, setIsOpen] = useState(false);
  const [colorMode] = useColorMode();
  return (
    <div sx={{ display: "flex" }}>
      <Button
        sx={{ width: rem(48), height: rem(48), backgroundColor: "transparent" }}
        onClick={() => setIsOpen(true)}
      >
        <div
          sx={{
            display: "flex",
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FiMenu aria-hidden sx={{ width: rem(24), height: rem(24) }} />
          <VisuallyHidden>{t("drawer.open")}</VisuallyHidden>
        </div>
      </Button>
      <Global
        styles={css`
          :root {
            --reach-dialog: 1;
          }
        `}
      />
      {isOpen && (
        <DialogOverlay
          onDismiss={() => {
            setIsOpen(false);
          }}
          key="dialog"
          sx={{
            height: "100%",
            width: "100%",
            position: "fixed",
            opacity: isOpen ? 1 : 0,
            transition: "opacity 0.2s",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            overflow: "auto",
            zIndex: 2000,
            background: "hsla(0, 0%, 0%, 0.33)",
          }}
        >
          <DialogContent
            sx={{
              position: "fixed",
              width: "100%",
              maxWidth: rem(400),
              left: 0,
              height: "100%",
              backgroundColor: colorMode === "default" ? "surface" : "background",
              px: 2,
              pb: 2,
              pt: 0,
              outline: "none",
              overflow: "auto",
            }}
          >
            <Stack space={1}>
              <Button
                sx={{ width: rem(48), height: rem(48), backgroundColor: "transparent" }}
                onClick={() => {
                  setIsOpen(false);
                }}
              >
                <VisuallyHidden>{t("drawer.close")}</VisuallyHidden>
                <span
                  aria-hidden
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                  }}
                >
                  <FiX aria-hidden sx={{ width: 24, height: 24 }} />
                </span>
              </Button>
              <Stack space={4} sx={{ width: "100%" }}>
                <NavPanel sortMenu={null} onClick={() => setIsOpen(false)} />
                {children}
              </Stack>
            </Stack>
          </DialogContent>
        </DialogOverlay>
      )}
    </div>
  );
}
