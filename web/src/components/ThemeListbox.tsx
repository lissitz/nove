/** @jsx jsx */
import * as React from "react";
import VisuallyHidden from "@reach/visually-hidden";
import { FiChevronDown } from "react-icons/fi";
import { jsx, useColorMode, Box } from "theme-ui";
import { useTranslation } from "../i18n";
import { ListboxButton, ListboxInput, ListboxList, ListboxOption, ListboxPopover } from "./Listbox";
import { FiSun, FiMoon } from "react-icons/fi";
import { themes } from "../constants";
import rem from "../utils/rem";
import { Columns, Column } from "./Columns";
import { IconType } from "react-icons/lib/cjs";

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
  const [colorMode, setColorMode]: [string, (x: string) => void] = useColorMode();

  return (
    <React.Fragment>
      <VisuallyHidden id={labelId}>{t("themeListbox.choose")}</VisuallyHidden>
      <ListboxInput
        sx={{ width: "100%", height: "100%" }}
        aria-labelledby={labelId}
        value={colorMode}
        onChange={(value) => {
          setColorMode(value);
        }}
      >
        <ListboxButton sx={{ backgroundColor: "transparent", width: "100%", height: "100%", p: 2 }}>
          <Box as={Icons[colorMode]} sx={{ ...iconStyle, width: rem(20), height: rem(20) }} />
          <VisuallyHidden>{t(`themes.${colorMode}`)}</VisuallyHidden>
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
                    <Box as={Icons[theme]} sx={{ ...iconStyle, width: rem(16), height: rem(16) }} />
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
