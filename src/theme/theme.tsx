import { colors } from "./colors";
import { lighten, darken } from "polished";
import rem from "../utils/rem";
const baseStyles = {
  "*": {
    color: "inherit",
  },
  a: {
    color: "link",
  },
  h1: {
    variant: "text.heading",
    fontSize: 1,
  },
  h2: {
    variant: "text.heading",
    fontSize: 1,
  },
  h3: {
    variant: "text.heading",
    fontSize: 1,
  },
  h4: {
    variant: "text.heading",
    fontSize: 1,
  },
  h5: {
    variant: "text.heading",
    fontSize: 1,
  },
  h6: {
    variant: "text.heading",
    fontSize: 1,
  },
  pre: {
    fontFamily: "monospace",
    overflowX: "auto",
    code: {
      color: "inherit",
    },
    backgroundColor: "quote",
    borderRadius: 4,
    padding: 2,
    lineHeight: 1.15,
  },
  blockquote: {
    backgroundColor: "quote",
    borderRadius: 4,
    padding: 2,
  },
  code: {
    fontFamily: "monospace",
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
  },
  th: {
    textAlign: "left",
    borderBottomStyle: "solid",
  },
  td: {
    textAlign: "left",
    borderBottomStyle: "solid",
  },
  body: {
    color: "text",
  },
};

export const theme = {
  breakpoints: ["48em", "64em"],
  space: pxsToRem([0, 4, 8, 16, 32, 64, 128, 256, 512]),
  fonts: {
    body:
      "Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji",
    heading:
      "Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji",
    monospace: "Menlo, monospace",
  },
  fontSizes: pxsToRem([12, 14, 16, 20, 24, 32, 48, 64, 96]),
  fontWeights: {
    body: 400,
    heading: 500,
    bold: 700,
  },
  lineHeights: {
    body: 1.5,
    heading: 1.15,
  },
  colors: {
    text: "#222",
    textSecondary: colors.gray[6],
    textButton: "#222",
    background: "#fafafa",
    primary: colors.gray[3],
    link: "#07c",
    secondary: colors.gray[3],
    muted: colors.gray[1],
    surface: "white",
    quote: colors.gray[0],
    ...colors,
    modes: {
      deep: {
        text: "hsl(210, 50%, 96%)",
        textSecondary: darken(0.1, "hsl(210, 50%, 96%)"),
        textButton: "hsl(210, 50%, 96%)",
        background: "hsl(230, 25%, 18%)",
        primary: lighten(0.1, "hsl(230, 25%, 18%)"),
        quote: lighten(0.2, "hsl(230, 25%, 18%)"),
        link: "hsl(260, 100%, 80%)",
        secondary: lighten(0.1, "hsl(230, 25%, 18%)"),
        highlight: "hsl(260, 20%, 40%)",
        purple: "hsl(290, 100%, 80%)",
        muted: "hsla(230, 20%, 0%, 20%)",
        gray: "hsl(210, 50%, 60%)",
        surface: lighten(0.1, "hsl(230, 25%, 18%)"),
      },
    },
  },
  text: {
    heading: {
      fontFamily: "heading",
      lineHeight: "heading",
      fontWeight: "heading",
    },
  },
  styles: {
    root: {
      fontFamily: "body",
      lineHeight: "body",
      fontWeight: "body",
      fontSize: 1,
      ...baseStyles,
    },
    ...baseStyles,
  },
  buttons: {
    primary: {
      color: "background",
      bg: "primary",
      "&:hover": {
        bg: "gray.2",
      },
      py: 1,
      px: 2,
    },
    secondary: {
      color: "secondary",
      bg: "background",
      "&:hover": {
        bg: "gray.2",
      },
      py: 1,
      px: 2,
    },
  },
  cards: {
    primary: {
      padding: 3,
      borderRadius: [0, null, 4],
      boxShadow:
        "0px 0px 0px 1px  rgba(0, 0, 0, 0.1) ,  0px 1px 3px  rgba(0, 0, 0, 0.1)",
      backgroundColor: "surface",
    },
  },
};

export const tabStyles = {
  px: 3,
  py: 2,
  borderRadius: 0,
  backgroundColor: "surface",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  ":after": {
    borderRadius: 0,
  },
};

export const textAreaStyles = {
  border: "none",
  bg: "background",
  width: "100%",
  p: 2,
  fontSize: 1,
  borderRadius: 4,
  resize: "vertical",
  minHeight: rem(64),

  //just to remove the vertical-align:baseline of the default display:inline-block that adds space at the bottom
  display: "block",
};

function pxsToRem(pxs: number[]) {
  return pxs.map((px) => `${px * 0.0625}rem`);
}
