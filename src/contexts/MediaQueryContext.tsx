import useMediaQuery from "@material-ui/core/useMediaQuery";
import * as React from "react";
import { useContext } from "react";
import { theme } from "../theme/theme";

const MediaContext = React.createContext<Device | null>(null);

type Device = "mobile" | "tablet" | "desktop";
export function MediaQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const desktop = useMediaQuery(`(min-width:${theme.breakpoints[1]})`, {
    noSsr: true,
  });
  const tablet = useMediaQuery(`(min-width:${theme.breakpoints[0]})`, {
    noSsr: true,
  });

  const device = desktop ? "desktop" : tablet ? "tablet" : "mobile";

  if (desktop == null) {
    return null;
  } else
    return (
      <MediaContext.Provider value={device}>{children}</MediaContext.Provider>
    );
}

export function useIsDesktop() {
  const context = useContext(MediaContext);
  if (context === null) {
    throw new Error();
  }
  return context === "desktop";
}

export function useBreakpoint() {
  const context = useContext(MediaContext);
  if (context === null) {
    throw new Error();
  }
  return context;
}
