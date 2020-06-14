/** @jsx jsx */
import { jsx } from "theme-ui";
import { useTranslation } from "../i18n";
import { commentSortOptions as options } from "../constants";
import ButtonLink from "./ButtonLink";
import Stack from "./Stack";
import { useSearchParams } from "react-router-dom";
import { parseCommentSort } from "../utils/params";
import { Columns, Column } from "./Columns";
import { tabStyles } from "../theme/theme";
import { useIsDesktop } from "../contexts/MediaQueryContext";

export default function CommentSortMenu() {
  const t = useTranslation();
  const [params] = useSearchParams();
  const sort = parseCommentSort(params.get("sort"));

  const isDesktop = useIsDesktop();
  return isDesktop ? (
    <Stack space={2} sx={{ width: "100%" }}>
      <div sx={{ fontWeight: "600" }}>{t("sortComments")}</div>
      <Stack as="ul" space={2} sx={{ width: "100%" }}>
        {options.map((x) => (
          <li
            sx={{
              width: "100%",
            }}
            key={x}
          >
            <ButtonLink to={`?sort=${x}`} selected={x === sort}>
              {x}
            </ButtonLink>
          </li>
        ))}
      </Stack>
    </Stack>
  ) : (
    <Columns as="ul" sx={{ width: "100%", "*": { wordBreak: "normal" }, overflow: "auto" }}>
      {options.map((x) => (
        <Column as="li" key={x} sx={{ flex: "1 1 auto" }}>
          <ButtonLink to={`?sort=${x}`} selected={x === sort} sx={tabStyles}>
            {x}
          </ButtonLink>
        </Column>
      ))}
    </Columns>
  );
}
