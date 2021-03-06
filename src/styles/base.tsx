import * as React from "react";
import { Global, css } from "@emotion/core";
import "focus-visible";
import { theme, scrollbar } from "../theme/theme";
import rem from "../utils/rem";

export default function BaseStyles() {
  return (
    <React.Fragment>
      <Global
        //@ts-ignore
        styles={{
          "md *": {
            ...scrollbar,
          },
        }}
      />
      <Global
        styles={css`
          * {
            word-break: break-word;
          }
          /* the site will almost always have vertical overflow,
        so this prevents lateral displacement when that isn't true */
          body {
            overflow-y: scroll;
          }
          h1,
          h2,
          h3,
          h4,
          h5,
          h6 {
            margin: 0;
          }
          li,
          ul {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          pre {
            white-space: pre-wrap;
          }
          button {
            padding: 0;
            border: 0;
            background: transparent;
            cursor: pointer;
          }
          .js-focus-visible :focus:not(.focus-visible) {
            outline: none;
          }
          .md {
            ul {
              > * + * {
                margin-top: ${theme.space[1]};
              }
            }
            p {
              margin-top: 0;
              margin-bottom: ${theme.space[3]};
              &:last-child {
                margin-bottom: 0;
              }
            }
          }
        `}
      />
    </React.Fragment>
  );
}

export const maxWidth = rem(1150);
