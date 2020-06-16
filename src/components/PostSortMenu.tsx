/** @jsx jsx */
import { jsx } from "theme-ui";
import { postSortOptions as options } from "../constants";
import { useTranslation } from "../i18n";
import ButtonLink from "./ButtonLink";
import Stack from "./Stack";
import TopMenu from "./TopMenu";
import { useIsDesktop } from "../contexts/MediaQueryContext";
import { Columns, Column } from "./Columns";
import { tabStyles } from "../theme/theme";

export default function PostSortMenu({
  community,
  sort,
}: {
  community: string;
  sort: string;
}) {
  const t = useTranslation();
  const currentOptions =
    sort === "top"
      ? options.filter((x) => x !== "top")
      : (options as ReadonlyArray<string>);
  const isDesktop = useIsDesktop();
  return isDesktop ? (
    <Stack space={2} sx={{ width: "100%" }}>
      <div sx={{ fontWeight: "600" }}>{t("sortPosts")}</div>
      <Stack as="ul" space={2} sx={{ width: "100%" }}>
        {currentOptions.map((x) => (
          <li
            key={x}
            sx={{
              width: "100%",
            }}
          >
            <ButtonLink to={`/r/${community}/${x}`} selected={x === sort}>
              {x}
            </ButtonLink>
          </li>
        ))}
        {sort === "top" && <TopMenu defaultPeriod="today" />}
      </Stack>
    </Stack>
  ) : (
    <Columns as="ul" sx={{ width: "100%", "*": { wordBreak: "normal" } }}>
      {currentOptions.map((x) => (
        <Column as="li" key={x} sx={{ flex: "1 1 auto" }}>
          <ButtonLink
            to={`/r/${community}/${x}`}
            selected={x === sort}
            sx={tabStyles}
          >
            {x}
          </ButtonLink>
        </Column>
      ))}
      {sort === "top" && (
        <Column as="li">
          <TopMenu defaultPeriod="today" />
        </Column>
      )}
    </Columns>
  );
}
