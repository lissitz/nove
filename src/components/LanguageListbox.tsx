/** @jsx jsx */
import * as React from "react";
import { FiChevronDown } from "react-icons/fi";
import { jsx } from "theme-ui";
import { Language, languages, useLanguage, useSetLanguage } from "../i18n";
import rem from "../utils/rem";
import { Column, Columns } from "./Columns";
import {
  ListboxButton,
  ListboxInput,
  ListboxList,
  ListboxOption,
  ListboxPopover,
} from "./Listbox";

export default function LanguageListbox({ labelId }: { labelId: string }) {
  const setLanguage = useSetLanguage();
  const language = useLanguage();

  return (
    <React.Fragment>
      <ListboxInput
        sx={{ width: "100%", height: "100%" }}
        aria-labelledby={labelId}
        value={language}
        onChange={(value) => {
          setLanguage(value as Language);
        }}
      >
        <ListboxButton
          sx={{ minWidth: rem(128), width: "100%", height: "100%" }}
        >
          {languages[language].name}
          <FiChevronDown sx={{ ml: "auto" }} />
        </ListboxButton>
        <ListboxPopover sx={{ minWidth: "100%", width: "auto" }}>
          <ListboxList>
            {Object.entries(languages).map(([k, { name }]) => (
              <ListboxOption
                sx={{
                  display: "flex",
                  overflow: "hidden",
                  px: [3, null, 2],
                  py: [2, null, 1],
                }}
                value={k}
              >
                <Columns space={3} sx={{ width: "100%" }}>
                  <Column>
                    <span
                      sx={{
                        display: "flex",
                        wordBreak: "normal",
                      }}
                    >
                      {name}
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
