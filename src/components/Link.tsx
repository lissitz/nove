/** @jsx jsx */
import { Link as RRLink } from "react-router-dom";
import { jsx } from "theme-ui";
import { usePreload } from "../router";
export const linkStyles = {
  textDecoration: "none",
  color: "inherit",
  ":hover": {
    textDecoration: "underline",
  },
};
export default function Link({
  external = false,
  preload = true,
  to,
  state,
  sx,
  className = "",
  ...rest
}: {
  preload?: boolean;
  external?: boolean;
  to: string;
  [key: string]: any;
}) {
  const preloadFn = usePreload();
  const Comp = external ? "a" : RRLink;
  return (
    <Comp
      //@ts-ignore
      to={!external ? to : undefined}
      href={external ? to : undefined}
      className={className}
      sx={linkStyles}
      {...rest}
      onMouseDown={(event) => {
        rest.onMouseDown?.(event);
        if (preload) {
          preloadFn(to);
        }
      }}
      onClick={(event) => {
        rest.onClick?.(event);
      }}
    />
  );
}
