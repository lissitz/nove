/** @jsx jsx */
import * as React from "react";
import { jsx } from "theme-ui";
import { default as ReachTooltip } from "@reach/tooltip";
import "@reach/tooltip/styles.css";

export default function Tooltip(
  props: React.ComponentProps<typeof ReachTooltip>
) {
  return (
    <ReachTooltip
      sx={{
        bg: "text",
        border: "none",
        color: "background",
        borderRadius: 4,
        py: 1,
        px: 2,
        boxShadow: "none",
        fontSize: 1,
      }}
      {...props}
    />
  );
}
