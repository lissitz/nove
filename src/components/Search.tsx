/** @jsx jsx */
import { keyframes } from "@emotion/core";
import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxOption,
  ComboboxPopover,
} from "@reach/combobox";
//@ts-ignore
import { Suspense, unstable_useTransition, useState } from "react";
import { queryCache } from "react-query";
import { Card, jsx } from "theme-ui";
import { prefetchSearch, useSearch } from "../api";
import { useTranslation } from "../i18n";
import { useNavigate } from "../router";
import { theme } from "../theme/theme";
import rem from "../utils/rem";
import Link from "./Link";
import Skeleton from "./Skeleton";
import { alpha } from "@theme-ui/color";

export default function Search() {
  const t = useTranslation();
  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [transition, isPending] = unstable_useTransition({ timeoutMs: 2000 });
  return (
    <Combobox
      sx={{ width: "100%", position: "relative" }}
      aria-label={t("search.label")}
      onSelect={(value) => {
        setInputValue("");
        setSearchTerm("");
        let url = (queryCache as any)
          .getQueryData(["search", searchTerm])
          ?.find((x: any) => x.data.display_name === value)?.data.url;
        if (url) {
          navigate(url);
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
        onChange={(event: any) => {
          const value = event.target.value;
          setInputValue(value);
          transition(() => {
            prefetchSearch(value);
            setSearchTerm(value);
          });
        }}
        value={inputValue}
        placeholder={t("search.placeholder")}
      />
      <ComboboxPopover portal={false} sx={{ position: "absolute", width: "100%" }}>
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
              isPending={isPending}
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
  isPending,
  onClick,
}: {
  searchTerm: string;
  isPending: boolean;
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
              px: 2,
              py: 1,
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
            <Link
              to={data.url}
              tabIndex={-1}
              sx={{
                animation: isPending ? `200ms linear 500ms forwards ${makeVisible}` : undefined,
              }}
              onClick={onClick}
            >
              {data.display_name}
            </Link>
          </ComboboxOption>
        );
      })}
    </ComboboxList>
  ) : null;
}

const makeVisible = keyframes`
to {
  color: ${theme.colors.gray[6]}
}
`;
