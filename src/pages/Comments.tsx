/** @jsx jsx */
import { useParams } from "react-router-dom";
import { jsx } from "theme-ui";
import CommentList from "../components/CommentList";
import CommentSortMenu from "../components/CommentSortMenu";
import CommunityInfo from "../components/CommunityInfo";
import MainLayout, { End, Mid, Start } from "../components/MainLayout";
import NavPanel from "../components/NavPanel";
import PostContent from "../components/PostContent";
import Stack from "../components/Stack";
import { useIsDesktop } from "../contexts/MediaQueryContext";

export default function Comments() {
  let { community, postId } = useParams();
  const isDesktop = useIsDesktop();
  if (!community) return null;
  community = community.toLowerCase();
  return (
    <MainLayout as="main">
      <Start>
        <NavPanel sortMenu={<CommentSortMenu />} />
      </Start>
      <Mid>
        <Stack space={[0, null, 3]} sx={{ width: "100%" }}>
          <Stack space={[2, null, 0]} sx={{ width: "100%" }}>
            {!isDesktop && <CommentSortMenu />}
            <PostContent community={community} postId={postId} />
          </Stack>
          <CommentList community={community} postId={postId} />
        </Stack>
      </Mid>
      <End>
        <CommunityInfo community={community} />
      </End>
    </MainLayout>
  );
}
