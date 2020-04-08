/** @jsx jsx */
import * as React from "react";
import { jsx } from "theme-ui";
import { theme } from "../theme/theme";

export const buttonStyles = {};

export const callToActionStyles = {
  bg: "text",
  color: "background",
  fontWeight: 600,
};

export const outlineStyles = {
  color: "text",
  borderColor: "text",
  borderStyle: "solid",
  borderWidth: 1,
};

export default function Button({
  children,
  selected = false,
  as: Comp = "button",
  ...rest
}: {
  children?: React.ReactNode;
  selected?: boolean;
  [key: string]: any;
}) {
  return (
    <Comp
      sx={{
        display: "block",
        px: 2,
        py: 1,
        borderRadius: 4,
        bg: "primary",
        position: "relative",
        cursor: "pointer",
        color: "textButton",
        "&:hover": {
          textDecoration: "none",
          "&:after": {
            opacity: selected ? 0.1 : 0.05,
          },
          "&:active": {
            "&:after": {
              opacity: 0.1,
            },
          },
        },
        "&:after": {
          content: '""',
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          transition: "opacity 0.15s",
          opacity: selected ? 0.1 : 0,
          borderRadius: 4,
          backgroundColor: "text",
        },
      }}
      {...rest}
    >
      {children}
    </Comp>
  );
}
