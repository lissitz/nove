/** @jsx jsx */
import { jsx } from "theme-ui";

export default function AspectRatio({
  ratio,
  children,
  ...rest
}: {
  ratio: number;
  children: React.ReactNode;
  [key: string]: any;
}) {
  return (
    <div
      className="text"
      sx={{
        position: "relative",
        ":after": {
          content: "''",
          display: "block",
          height: 0,
          width: "100%",
          pt: `${ratio * 100}%`,
        },
      }}
      {...rest}
    >
      <div
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      >
        {children}
      </div>
    </div>
  );
}
