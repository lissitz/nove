/** @jsx jsx */
import { Link as RRLink, useLocation } from "react-router-dom";
import { jsx } from "theme-ui";
import { usePreload } from "../router";
import { useDispatchScroll } from "../contexts/scrollContext";
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
  const location = useLocation();
  const dispatch = useDispatchScroll();
  return (
    <Comp
      //@ts-ignore
      to={!external ? to : undefined}
      href={external ? to : undefined}
      className={className}
      sx={linkStyles}
      {...rest}
      onMouseDown={(event:MouseEvent) => {
        rest.onMouseDown?.(event);
        if (preload) {
          preloadFn(to);
        }
      }}
      onClick={(event:MouseEvent) => {
        rest.onClick?.(event);
        dispatch({ [location.key]: { x: window.scrollX, y: window.scrollY } });
      }}
    />
  );
}
