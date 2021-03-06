/** @jsx jsx */
import * as React from "react";
import { useState } from "react";
import VisuallyHidden from "@reach/visually-hidden";
import { jsx, useColorMode, Box } from "theme-ui";
import { useTranslation } from "../i18n";
import {
  ListboxButton,
  ListboxInput,
  ListboxList,
  ListboxOption,
  ListboxPopover,
} from "./Listbox";
import { FiSun, FiMoon } from "react-icons/fi";
import { themes } from "../constants";
import rem from "../utils/rem";
import { Columns, Column } from "./Columns";
import { IconType } from "react-icons/lib/cjs";
import { Global } from "@emotion/core";

const labelId = "theme-listbox";
const iconStyle = {
  height: rem(20),
  width: rem(20),
  margin: "0 auto",
  verticalAlign: "middle",
};
const Icons = {
  default: FiSun,
  deep: FiMoon,
} as { [key: string]: IconType };

export default function ThemeListbox() {
  const t = useTranslation();
  const [colorMode, setColorMode]: [
    string,
    (x: string) => void
  ] = useColorMode();
  const [addTransitions, setAddTransitions] = useState(false);

  return (
    <React.Fragment>
      <VisuallyHidden id={labelId}>{t("themeListbox.choose")}</VisuallyHidden>
      <Global
        styles={
          addTransitions
            ? `
          * {
            transition: color 0.2s ease-out;
            transition: background-color 0.2s ease-out;
          }
        `
            : ""
        }
      />
      <ListboxInput
        sx={{ width: "100%", height: "100%" }}
        aria-labelledby={labelId}
        value={colorMode}
        onChange={(value) => {
          setAddTransitions(true);
          setTimeout(() => {
            setAddTransitions(false);
          }, 500);
          setColorMode(value);
        }}
      >
        <ListboxButton
          sx={{
            backgroundColor: "transparent",
            width: "100%",
            height: "100%",
            p: 2,
          }}
        >
          <Box
            as={Icons[colorMode]}
            aria-hidden
            sx={{ ...iconStyle, width: rem(20), height: rem(20) }}
          />
        </ListboxButton>
        <ListboxPopover sx={{ width: "auto" }}>
          <ListboxList>
            {themes.map((theme) => (
              <ListboxOption
                sx={{ display: "flex", overflow: "hidden", px: 3, py: 2 }}
                value={theme}
              >
                <Columns space={3} sx={{ width: "100%" }}>
                  <Column sx={{ width: rem(30) }}>
                    <Box
                      as={Icons[theme]}
                      aria-hidden
                      sx={{ ...iconStyle, width: rem(16), height: rem(16) }}
                    />
                  </Column>
                  <Column>
                    <span
                      sx={{
                        display: "flex",
                        wordBreak: "normal",
                      }}
                    >
                      {t(`themes.${theme}`)}
                    </span>
                  </Column>
                </Columns>
              </ListboxOption>
            ))}
          </ListboxList>
        </ListboxPopover>
      </ListboxInput>
    </React.Fragment>
  );
}
