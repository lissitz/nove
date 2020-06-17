/** @jsx jsx */
import * as React from "react";
import { Outlet, useParams } from "react-router-dom";
import { jsx } from "theme-ui";
import CommunityHeader from "../components/CommunityHeader";
import NavBar from "../components/NavBar";
import Stack from "../components/Stack";
import { maxWidth } from "../styles/base";
import CommunityInfo from "../components/CommunityInfo";
import { parseCommunity } from "../utils/params";

export default function CommunityBase() {
  let { community } = useParams();
  community = parseCommunity(community);
  return (
    <React.Fragment>
      <NavBar>
        <CommunityInfo community={community} />
      </NavBar>
      <div sx={{ width: "100%", flex: "1 1 auto" }}>
        <Stack space={[4, null, 4]} sx={{ height: "100%" }}>
          <CommunityHeader community={community} />
          <div sx={{ maxWidth: "100%", width: maxWidth, margin: "0 auto" }}>
            <Outlet />
          </div>
        </Stack>
      </div>
    </React.Fragment>
  );
}
