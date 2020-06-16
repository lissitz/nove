/** @jsx jsx */
import { css, keyframes } from "@emotion/core";
import { jsx } from "theme-ui";
import rem from "../utils/rem";

const wave = keyframes({
  "0%": {
    transform: "translateX(-100%)",
  },
  "100%": {
    transform: "translateX(100%)",
  },
});
export default function Skeleton({
  height = rem(200),
  as: Component,
  className = "",
}: {
  height?: string;
  as?: any;
  className?: string;
}) {
  return (
    <div
      sx={{
        position: "relative",
        width: "100%",
        height,
        overflow: "hidden",
        "::after": {
          content: '""',
          width: "100%",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          background: ({ colors }: any) =>
            `linear-gradient(90deg, transparent, ${colors.gray[1]}, transparent)`,
          position: "absolute",
        },
      }}
      className={className}
      css={css`
        ::after {
          animation: ${wave} 2s infinite;
        }
      `}
    >
      <Component sx={{ height, boxShadow: "none" }} />
    </div>
  );
}
