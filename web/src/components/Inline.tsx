/** @jsx jsx */
import React, { createContext, useContext } from "react";
import { jsx } from "theme-ui";

export const InlinesContext = createContext<number | (number | null)[]>(0);

export function Inlines({
  children,
  space = 0,
  className = "",
  as: Comp = "div",
  ...rest
}: {
  children: React.ReactNode;
  space?: number | (number | null)[];
  className?: string;
  as?: any;
  [key: string]: any;
}) {
  return (
    <div sx={{ mt: -space }}>
      <Comp sx={{ display: "flex", flexWrap: "wrap", ml: -space }} className={className} {...rest}>
        <InlinesContext.Provider value={space}>{children}</InlinesContext.Provider>
      </Comp>
    </div>
  );
}

export function Inline({
  children,
  className = "",
  sx,
  as: Comp = "div",
  ...rest
}: {
  children?: React.ReactNode;
  className?: any;
  as?: any;
  [key: string]: any;
}) {
  const space = useContext(InlinesContext);
  return (
    <Comp sx={{ pl: space, pt: space }} className={className} {...rest}>
      {children}
    </Comp>
  );
}
