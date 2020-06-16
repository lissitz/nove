/** @jsx jsx */
import React, { createContext, useContext } from "react";
import { jsx } from "theme-ui";

export const ColumnsContext = createContext<number | (number | null)[]>(0);

export function Columns({
  children,
  space = 0,
  className = "",
  sx,
  as: Component = "div",
  ...rest
}: {
  children?: React.ReactNode;
  space?: number | (number | null)[];
  className?: string;
  sx?: any;
  as?: any;
  [key: string]: any;
}) {
  return (
    <Component
      sx={{ display: "flex", ml: -space }}
      className={className}
      {...rest}
    >
      <ColumnsContext.Provider value={space}>
        {children}
      </ColumnsContext.Provider>
    </Component>
  );
}

export function Column({
  children,
  className = "",
  sx,
  as: Component = "div",
  ...rest
}: {
  children?: React.ReactNode;
  className?: any;
  sx?: any;
  as?: any;
  [key: string]: any;
}) {
  const space = useContext(ColumnsContext);
  return (
    <Component sx={{ width: "100%" }} className={className} {...rest}>
      <div sx={{ pl: space, height: "100%" }}>{children}</div>
    </Component>
  );
}
