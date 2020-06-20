/** @jsx jsx */
import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxOption,
  ComboboxPopover,
} from "@reach/combobox";
import { alpha } from "@theme-ui/color";
//@ts-ignore
import { Suspense, useState, useRef } from "react";
import { queryCache } from "react-query";
import { Card, jsx } from "theme-ui";
import { prefetchSearch, useSearch } from "../api";
import { useTranslation } from "../i18n";
import { useNavigate } from "../router";
import rem from "../utils/rem";
import Link from "./Link";
import Skeleton from "./Skeleton";

export default function Search() {
  const t = useTranslation();
  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const ref = useRef<HTMLElement>();
  return (
    <Combobox
      sx={{ width: "100%", position: [undefined, "relative", null] }}
      aria-label={t("search.label")}
      onSelect={(value) => {
        setInputValue("");
        setSearchTerm("");
        let url = (queryCache as any)
          .getQueryData(["search", searchTerm])
          ?.find((x: any) => x.data.display_name === value)?.data.url;
        if (url) {
          navigate(url);
          ref.current?.blur?.();
        }
      }}
    >
      <ComboboxInput
        selectOnClick
        sx={{
          width: "100%",
          bg: "background",
          border: 1,
          borderStyle: "solid",
          borderColor: "primary",
          borderRadius: 4,
          py: 1,
          px: 2,
        }}
        ref={ref}
        onChange={(event: any) => {
          const value = event.target.value;
          setInputValue(value);
          prefetchSearch(value);
          setSearchTerm(value);
        }}
        value={inputValue}
        placeholder={t("search.placeholder")}
      />
      <ComboboxPopover
        portal={false}
        sx={{ position: "absolute", width: ["100vw", "100%", null], left: 0 }}
      >
        <div
          sx={{
            mt: 3,
            backgroundColor: "surface",
            borderRadius: 4,
            boxShadow: "0 0 8px rgba(0,0,0,0.125)",
          }}
        >
          <Suspense fallback={<Skeleton as={Card} height={rem(180)} />}>
            <ComboboxContent
              searchTerm={searchTerm}
              onClick={() => {
                setInputValue("");
                setSearchTerm("");
              }}
            />
          </Suspense>
        </div>
      </ComboboxPopover>
    </Combobox>
  );
}

function ComboboxContent({
  searchTerm,
  onClick,
}: {
  searchTerm: string;
  onClick: () => void;
}) {
  let { data: search } = useSearch(searchTerm);
  return search && search.length !== 0 ? (
    <ComboboxList>
      {search.map(({ data }) => {
        return (
          <ComboboxOption
            key={`${data.id}${searchTerm}`}
            value={data.display_name}
            sx={{
              px: [3, null, 2],
              py: [2, null, 1],
              transition: "background-color 0.15s",
              cursor: "pointer",
              "&&[data-highlighted]": {
                backgroundColor: alpha("text", 0.1),
              },
              "&:hover": {
                backgroundColor: alpha("text", 0.05),
              },
              "&:active": {
                backgroundColor: alpha("text", 0.1),
              },
            }}
          >
            <Link to={data.url} tabIndex={-1} onClick={onClick}>
              {data.display_name}
            </Link>
          </ComboboxOption>
        );
      })}
    </ComboboxList>
  ) : null;
}
