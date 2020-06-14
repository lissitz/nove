/** @jsx jsx */
import { useParams } from "react-router-dom";
import { jsx } from "theme-ui";
import CommunityInfo from "../components/CommunityInfo";
import MainLayout, { End, Mid, Start } from "../components/MainLayout";
import PostForm from "../components/PostForm";
import { parseCommunity } from "../utils/params";

export default function SubmitPost() {
  let { community } = useParams();
  community = parseCommunity(community);
  return (
    <MainLayout as="main">
      <Start />
      <Mid>
        <PostForm storageKey={`nove_post_form_draft${community}`} community={community} />
      </Mid>
      <End>
        <CommunityInfo community={community} />
      </End>
    </MainLayout>
  );
}
