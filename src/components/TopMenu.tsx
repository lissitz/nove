/** @jsx jsx */
import VisuallyHidden from "@reach/visually-hidden";
import { FiChevronDown } from "react-icons/fi";
import { useLocation, useSearchParams } from "react-router-dom";
import { jsx } from "theme-ui";
import { useIsDesktop } from "../contexts/MediaQueryContext";
import { useTranslation } from "../i18n";
import { useNavigate } from "../router";
import { tabStyles } from "../theme/theme";
import rem from "../utils/rem";
import {
  ListboxButton,
  ListboxInput,
  ListboxLink,
  ListboxList,
  ListboxOption,
  ListboxPopover,
} from "./Listbox";

const periods = ["hour", "today", "week", "month", "year", "all"] as const;
const labelId = "top-menu";
type Period = typeof periods[number];
export default function TopMenu({
  title,
  defaultPeriod,
}: {
  title: string;
  defaultPeriod: string;
}) {
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
        {`${title} - ${t(`periods.${initialPeriod}`)}}`}
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
          <span>{title}</span>
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
          <FiChevronDown
            aria-hidden
            sx={{ verticalAlign: "middle", ml: [2, null, 0] }}
          />
        </ListboxButton>
        <ListboxPopover>
          <ListboxList>
            {periods.map((period) => (
              <ListboxOption
                value={period}
                sx={{ px: [3, null, 2], py: [2, null, 1] }}
              >
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
