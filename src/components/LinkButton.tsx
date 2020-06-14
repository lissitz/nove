/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import { linkStyles } from "./Link";

//button that looks like a link
type ButtonProps = React.ComponentProps<"button">;
export default function ButtonLink(props: ButtonProps) {
  return <button sx={linkStyles} {...props} />;
}
