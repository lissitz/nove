/** @jsx jsx */
import VisuallyHidden from "@reach/visually-hidden";
import { FiChevronDown } from "react-icons/fi";
import { useLocation, useSearchParams } from "react-router-dom";
import { jsx } from "theme-ui";
import { useTranslation } from "../i18n";
import { useNavigate } from "../router";
import rem from "../utils/rem";
import {
  ListboxButton,
  ListboxInput,
  ListboxLink,
  ListboxList,
  ListboxOption,
  ListboxPopover,
} from "./Listbox";
import { useIsDesktop } from "../contexts/MediaQueryContext";
import {  tabStyles } from "../theme/theme";

if (process.env.NODE_ENV === "development") {
  const t = (x: any) => {};
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const keys = [t("hour"), t("today"), t("week"), t("month"), t("year"), t("all")];
}
const periods = ["hour", "today", "week", "month", "year", "all"] as const;
const labelId = "top-menu";
type Period = typeof periods[number];
export default function TopMenu({ defaultPeriod }: { defaultPeriod: string }) {
  const t = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const initialPeriod = params.get("t") || defaultPeriod;
  const to = (x: string) => {
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.delete("t");
    newSearchParams.append("t", x);
    return "?" + newSearchParams.toString();
  };
  const isDesktop = useIsDesktop();
  return (
    <div sx={{ width: "100%" }}>
      <VisuallyHidden id={labelId}>
        {`${t("top")} - ${t(`periods.${initialPeriod}`)}}`}
      </VisuallyHidden>
      <ListboxInput
        sx={{ width: "100%" }}
        aria-labelledby={labelId}
        value={initialPeriod}
        onChange={(value) => {
          navigate(to(value));
        }}
      >
        <ListboxButton sx={!isDesktop ? tabStyles : {}}>
          <span>{t("top")}</span>
          <span
            sx={{
              color: "text",
              bg: "secondary",
              display: ["none", null, "inline-block"],
              fontSize: 0,
              fontWeight: "500",
              borderRadius: 16,
              pl: 2,
              pr: 2,
              mr: 2,
              ml: "auto",
              minWidth: rem(40),
              textAlign: "center",
            }}
          >
            {t(`periods.${initialPeriod}`)}
          </span>
          <FiChevronDown aria-hidden sx={{ verticalAlign: "middle" }} />
        </ListboxButton>
        <ListboxPopover>
          <ListboxList>
            {periods.map((period) => (
              <ListboxOption value={period}>
                <ListboxLink to={to(period)} external>
                  {t(`periods.${period}`)}
                </ListboxLink>
              </ListboxOption>
            ))}
          </ListboxList>
        </ListboxPopover>
      </ListboxInput>
    </div>
  );
}
