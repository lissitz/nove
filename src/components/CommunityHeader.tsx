/** @jsx jsx */
import VisuallyHidden from "@reach/visually-hidden";
import { Fragment, Suspense } from "react";
import { jsx } from "theme-ui";
import { useCommunityInfo } from "../api";
import { maxWidth } from "../styles/base";
import { CommunityInfoData } from "../types";
import rem from "../utils/rem";
import { Column, Columns } from "./Columns";
import Link from "./Link";
import { useIsDesktop } from "../contexts/MediaQueryContext";

export default function CommunityHeader({ community }: { community: string }) {
  if (community === "all" || community === "popular")
    return (
      <Fragment>
        <div sx={{ height: rem(128) }}></div>
        <VisuallyHidden>
          <h2>{community}</h2>
        </VisuallyHidden>
      </Fragment>
    );
  return (
    <Fragment>
      <VisuallyHidden>
        <h2>{community}</h2>
      </VisuallyHidden>
      <Suspense fallback={<Content community={community} loaded={false} />}>
        <Wrapper community={community} />
      </Suspense>
    </Fragment>
  );
}

export function Wrapper({ community }: { community: string }) {
  let { data: info } = useCommunityInfo(community);
  info = info!;
  return <Content community={community} loaded info={info} />;
}

function CommunityLogo({ icon_img }: { icon_img: string }) {
  return (
    <img
      //we already have the title
      alt=""
      src={icon_img || undefined}
      sx={{
        borderRadius: "50%",
        height: rem(100),
        width: rem(100),
        opacity: icon_img ? 1 : 0,
        transition: "opacity 0.2s",
      }}
    />
  );
}

function Content({
  community,
  loaded,
  info,
}: {
  community: string;
  loaded: boolean;
  info?: { data: CommunityInfoData };
}) {
  const isDesktop = useIsDesktop();
  return isDesktop ? (
    <div
      key={community}
      sx={{
        display: "flex",
        height: rem(128),
        width: "100%",
        position: "relative",
        borderLeft: 0,
        borderRight: 0,
      }}
    >
      <div
        sx={{
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
      >
        <div
          sx={{
            height: rem(80),
          }}
        />
        <div
          sx={{
            height: rem(10),
            backgroundColor: "gray.5",
            position: "relative",
            "&:after": {
              content: '""',
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              transition: "opacity 0.2s",
              opacity: loaded && info ? 1 : 0,
              backgroundColor: loaded && info ? info.data.key_color || "text" : "transparent",
            },
          }}
        />
      </div>
      <div
        sx={{
          maxWidth,
          width: "100%",
          margin: "0 auto",
          height: "100%",
          display: "flex",
        }}
      >
        <Columns
          space={3}
          sx={{
            height: "100%",
          }}
        >
          <Column sx={{ flex: "0 0 auto", width: "auto" }}>
            <div sx={{ display: "flex", alignItems: "center", height: "100%" }}>
              <div
                sx={{
                  backgroundColor: loaded && info ? info.data.key_color || "text" : "gray.5",
                  borderRadius: "50%",
                  height: rem(100),
                  width: rem(100),
                  ml: rem(218),
                  position: "relative",
                  opacity: info?.data && !info.data.icon_img ? 0 : 1,
                  transition: "all 0.2s",
                }}
              >
                <CommunityLogo icon_img={info?.data.icon_img || ""} />
              </div>
            </div>
          </Column>
          <Column sx={{ flex: "0 1 auto", width: "auto", minWidth: "0" }}>
            <div
              sx={{
                display: "flex",
                alignItems: "center",
                height: "100%",
              }}
            >
              <div
                sx={{
                  mb: 3,
                  zIndex: 1,
                  position: "relative",
                }}
              >
                <h3
                  sx={{
                    fontSize: 5,
                    height: rem(48),
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    lineHeight: (theme: any) => theme.lineHeights.body,
                  }}
                >
                  {info?.data.title}
                </h3>
                <Link
                  preload
                  to={`/r/${community}`}
                  sx={{
                    wordBreak: "initial",
                    position: "absolute",
                    mt: 3,
                    fontSize: 1,
                    color: "text",
                  }}
                >
                  {`/r/${community}`}
                </Link>
              </div>
            </div>
          </Column>
        </Columns>
      </div>
    </div>
  ) : null;
}
