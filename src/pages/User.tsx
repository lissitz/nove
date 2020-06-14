/** @jsx jsx */
import * as React from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useSearchParams } from "react-router-dom";
import { jsx } from "theme-ui";
import MainLayout, { Start, Mid, End } from "../components/MainLayout";
import Stack from "../components/Stack";
import UserInfo from "../components/UserInfo";
import UserOverview from "../components/UserOverview";
import UserOverviewSortMenu from "../components/UserOverviewSortMenu";
import { defaultUserOverviewSort, defaultUserWhere } from "../constants";
import { maxWidth } from "../styles/base";
import NavPanel from "../components/NavPanel";
import UserBar from "../components/UserBar";
import rem from "../utils/rem";
import NavBar from "../components/NavBar";
import { useIsDesktop } from "../contexts/MediaQueryContext";

export default function User() {
  let { username, where } = useParams();
  where = where || defaultUserWhere;
  let [params] = useSearchParams();
  const sort = params.get("sort") || defaultUserOverviewSort;
  const isDesktop = useIsDesktop();
  if (!username) return null;
  return (
    <React.Fragment>
      <Helmet>
        <title>{username}</title>
      </Helmet>
      <NavBar></NavBar>
      <div sx={{ width: "100%", flex: "1 1 auto" }}>
        <Stack space={[0, null, 4]} sx={{ height: "100%" }}>
          <div
            sx={{
              width: ["100%", null, maxWidth],
              margin: [0, null, "0 auto"],
              height: ["auto", null, rem(128)],
              mt: [2, null, 0],
            }}
          >
            <UserBar username={username} where={where} />
          </div>
          <div sx={{ maxWidth: "100%", width: maxWidth, margin: "0 auto", height: "100%" }}>
            <MainLayout as="main">
              <Start>
                <NavPanel sortMenu={<UserOverviewSortMenu sort={sort} />} />
              </Start>
              <Mid>
                <Stack space={[2, null, 0]} sx={{ width: "100%" }}>
                  {!isDesktop && <UserOverviewSortMenu sort={sort} />}
                  <UserOverview username={username} where={where} />
                </Stack>
              </Mid>
              <End>
                <UserInfo username={username} />
              </End>
            </MainLayout>
          </div>
        </Stack>
      </div>
    </React.Fragment>
  );
}
