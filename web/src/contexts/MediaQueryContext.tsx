import useMediaQuery from "@material-ui/core/useMediaQuery";
import * as React from "react";
import { useContext } from "react";
import { theme } from "../theme/theme";

const MediaContext = React.createContext<boolean | null>(null);

export function MediaQueryProvider({ children }: { children: React.ReactNode }) {
  const desktop = useMediaQuery(`(min-width:${theme.breakpoints[1]})`, { noSsr: true });
  if (desktop == null) {
    return null;
  } else return <MediaContext.Provider value={desktop}>{children}</MediaContext.Provider>;
}

export function useIsDesktop() {
  const context = useContext(MediaContext);
  if (context === null) {
    throw new Error();
  }
  return context;
}
