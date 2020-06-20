/** @jsx jsx */
import {
  ListboxInput as RListboxInput,
  ListboxButton as RListboxButton,
  ListboxPopover as RListboxPopover,
  ListboxList,
  ListboxOption as RListboxOption,
} from "@reach/listbox";
import { alpha } from "@theme-ui/color";
import { jsx } from "theme-ui";
import Button from "./Button";
import Link from "./Link";

function ListboxInput(props: React.ComponentProps<typeof RListboxInput>) {
  return <RListboxInput sx={{ position: "relative" }} {...props} />;
}

function ListboxButton(props: React.ComponentProps<typeof RListboxButton>) {
  return (
    <Button
      sx={{
        border: "none",
        display: "flex",
        alignItems: "center",
        position: "relative",
      }}
      {...props}
      as={RListboxButton}
    />
  );
}

function ListboxPopover(props: React.ComponentProps<typeof RListboxPopover>) {
  return (
    <RListboxPopover
      portal={false}
      sx={{
        width: "100%",
        mt: 1,
        backgroundColor: "surface",
        borderRadius: 4,
        boxShadow: `0 0 8px rgba(0,0,0,0.125)`,
        position: "absolute",
        zIndex: 2000,
      }}
      {...props}
    />
  );
}

function ListboxOption(props: React.ComponentProps<typeof RListboxOption>) {
  return (
    <RListboxOption
      sx={{
        px: 3,
        py: 2,
        cursor: "pointer",
        "&&:hover": {
          backgroundColor: alpha("text", 0.05),
        },
        "&&:active": {
          backgroundColor: alpha("text", 0.1),
        },
        '&[aria-selected="true"]': {
          backgroundColor: alpha("text", 0.1),
        },
      }}
      {...props}
    />
  );
}

function ListboxLink(props: React.ComponentProps<typeof Link>) {
  return (
    <Link
      tabIndex={-1}
      onClick={(event: any) => event.preventDefault()}
      sx={{
        display: "block",
        overflow: "hidden",
        "&:hover": { textDecoration: "none" },
      }}
      {...props}
    />
  );
}
export {
  ListboxInput,
  ListboxButton,
  ListboxOption,
  ListboxPopover,
  ListboxLink,
  ListboxList,
};
