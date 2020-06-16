/** @jsx jsx */
import * as React from "react";
import { jsx } from "theme-ui";

type StackProps = {
  children: React.ReactNode;
  space?: number | (number | null)[];
  align?: "start" | "center" | "end";
  sx?: any;
  [key: string]: any;
};
export default function Stack({
  children,
  space = 0,
  align = "start",
  sx,
  as: Component = "div",
  asChild: ChildComponent = "div",
  ...rest
}: StackProps) {
  return (
    <Component
      sx={{
        ...sx,
        "& > * + *": { mt: space },
      }}
      {...rest}
    >
      {React.Children.map(children, (x, index) => {
        //if x is falsy e.g. comes from a ternary condition we do not render a spacer component
        return (
          x && (
            <ChildComponent
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: align,
              }}
              key={index}
            >
              {x}
            </ChildComponent>
          )
        );
      })}
    </Component>
  );
}
