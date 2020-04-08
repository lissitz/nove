//https://www.reddit.com/r/reactjs/about.json
/** @jsx jsx */
import { jsx } from "theme-ui";
import ButtonLink from "./ButtonLink";
import { Inline, Inlines } from "./Inline";
import { useMe } from "../api";
import Stack from "./Stack";
import { useTranslation } from "../i18n";
import { useIsDesktop } from "../contexts/MediaQueryContext";
import { Columns, Column } from "./Columns";
import { tabStyles } from "../theme/theme";
import MainLayout, { Start, Mid, End } from "./MainLayout";

const privateUserBarOptions = [
  "overview",
  "submitted",
  "comments",
  "upvoted",
  "downvoted",
  "hidden",
  "saved",
  "gilded",
];
const publicUserBarOptions = ["overview", "submitted", "comments", "gilded"];
export default function UserBar({ username, where }: { username: string; where: string }) {
  const { data: me } = useMe();
  const t = useTranslation();
  const isDesktop = useIsDesktop();
  return isDesktop ? (
    <MainLayout sx={{ height: "100%" }}>
      <Start />
      <Mid>
        <div sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <div sx={{ mt: "auto" }}>
            <Stack space={2} sx={{ width: "100%" }}>
              <div sx={{ fontWeight: "600" }}>{t("userBar.filter")}</div>
              <Inlines space={2} as="ul">
                {(me && me.name === username ? privateUserBarOptions : publicUserBarOptions).map(
                  (option) => (
                    <Inline as="li">
                      <ButtonLink to={`/u/${username}/${option}`} selected={where === option}>
                        {option}
                      </ButtonLink>
                    </Inline>
                  )
                )}
              </Inlines>
            </Stack>
          </div>
        </div>
      </Mid>
      <End />
    </MainLayout>
  ) : (
    <Stack space={2} sx={{ width: "100%" }}>
      <Columns as="ul" sx={{ overflow: "auto", width: "100%", "*": { wordBreak: "normal" } }}>
        {(me && me.name === username ? privateUserBarOptions : publicUserBarOptions).map(
          (option) => (
            <Column as="li" sx={{ minWidth: "25%" }}>
              <ButtonLink
                to={`/u/${username}/${option}`}
                selected={where === option}
                sx={tabStyles}
              >
                {option}
              </ButtonLink>
            </Column>
          )
        )}
      </Columns>
    </Stack>
  );
}
