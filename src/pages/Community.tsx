/** @jsx jsx */
import { useParams } from "react-router-dom";
import { jsx } from "theme-ui";
import CommunityInfo from "../components/CommunityInfo";
import MainLayout, { End, Mid, Start } from "../components/MainLayout";
import NavPanel from "../components/NavPanel";
import PostList from "../components/PostList";
import PostSortMenu from "../components/PostSortMenu";
import { parseCommunity, parseSort } from "../utils/params";
import { useIsDesktop } from "../contexts/MediaQueryContext";
import Stack from "../components/Stack";

export default function Community() {
  let { community, sort: unparsedSort } = useParams();
  community = parseCommunity(community);
  const sort = parseSort(unparsedSort);
  const isDesktop = useIsDesktop();
  return (
    <MainLayout as="main">
      <Start>
        <NavPanel sortMenu={<PostSortMenu community={community} sort={sort} />} />
      </Start>
      <Mid>
        <Stack space={[2, null, 3]}>
          {!isDesktop && <PostSortMenu community={community} sort={sort} />}
          <PostList community={community} sort={sort} />
        </Stack>
      </Mid>
      <End>
        <CommunityInfo community={community} />
      </End>
    </MainLayout>
  );
}
