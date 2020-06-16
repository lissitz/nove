/** @jsx jsx */
import { jsx } from "theme-ui";
import * as React from "react";
import Link from "./Link";
import Button from "./Button";

//link that looks like a button
type LinkProps = React.ComponentProps<typeof Link>;
export default function ButtonLink(props: LinkProps) {
  return <Button as={Link} {...props} />;
}
