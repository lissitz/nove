//https://www.reddit.com/r/reactjs/about.json
/** @jsx jsx */
import { ComponentProps } from "react";
import { Card, jsx } from "theme-ui";
import { useUserInfo } from "../api";
import { useTranslation, useFormat } from "../i18n";
import rem from "../utils/rem";
import Skeleton from "./Skeleton";
import Stack from "./Stack";

export default function UserInfo({ username }: { username: string }) {
  const { data: user, status: infoStatus } = useUserInfo(username);
  const t = useTranslation();
  const format = useFormat();
  return (
    <Stack as="aside" space={4} sx={{ fontSize: 1 }}>
      {infoStatus === "loading" || infoStatus === "idle" ? (
        <Skeleton as={SideCard} height={rem(150)} />
      ) : infoStatus === "error" ? null : (
        user && (
          <Card sx={{ width: "100%" }}>
            <Stack space={3}>
              <div sx={{ fontWeight: "600", fontSize: 2 }}>{user.name}</div>
              <Stack space={2}>
                <div>
                  <span sx={{ fontWeight: "600" }}>
                    {format.quantity(user.comment_karma, t)}
                  </span>
                  {" " + t("internetPoints")}
                </div>
                <div>
                  {t("memberSince") + " "}
                  <span sx={{ fontWeight: "600" }}>
                    {new Date(user.created_utc * 1000).toLocaleDateString(
                      "en-US"
                    )}
                  </span>
                </div>
              </Stack>
            </Stack>
          </Card>
        )
      )}
    </Stack>
  );
}

function SideCard(props: ComponentProps<typeof Card>) {
  return <Card sx={{ width: "100%" }} {...props} />;
}
