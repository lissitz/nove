//https://www.reddit.com/r/reactjs/about.json
/** @jsx jsx */
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
} from "@reach/accordion";
import * as React from "react";
import { ComponentProps, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { queryCache } from "react-query";
import { useLocation } from "react-router-dom";
import { Card, jsx, useColorMode } from "theme-ui";
import { useCommunityInfo, useCommunityRules, useSubscribe } from "../api";
import { useIsAuthenticated } from "../contexts/authContext";
import { useTranslation, useFormat } from "../i18n";
import type { CommunityInfoData } from "../types";
import { sanitize } from "../utils/format";
import { isCombinedCommunity } from "../utils/isCombinedCommunity";
import rem from "../utils/rem";
import Button, { callToActionStyles, outlineStyles } from "./Button";
import ButtonLink from "./ButtonLink";
import Skeleton from "./Skeleton";
import Stack from "./Stack";

const show_description = false;
function Content({ community }: { community: string }) {
  let { status, data: info } = useCommunityInfo(community);
  info = info!;
  const t = useTranslation();
  const isAuthenticated = useIsAuthenticated();
  const location = useLocation();
  const format = useFormat();
  return status === "success" ? (
    <Wrapper>
      <SideCard>
        <Stack space={4}>
          <Stack space={2}>
            <h2 sx={{ fontWeight: "600", fontSize: 2 }}>{t("about")}</h2>
            <div
              dangerouslySetInnerHTML={{
                __html: sanitize(info.data.public_description_html || ""),
              }}
            />
            <div>
              <span sx={{ fontWeight: "600" }}>
                {format.quantity(info.data.subscribers, t)}
              </span>
              {" " + t("subscribers")}
            </div>
            <div>
              {t("created") + " "}
              <span sx={{ fontWeight: "600" }}>
                {new Date(info.data.created_utc * 1000).toLocaleDateString(
                  "en-US"
                )}
              </span>
            </div>
          </Stack>
          <Stack space={2} sx={{ width: "100%" }}>
            {isAuthenticated && (
              <JoinButton
                user_is_subscriber={info.data.user_is_subscriber}
                community={community}
                info={info}
              />
            )}
            {isAuthenticated && !location.pathname.endsWith("submit") && (
              <ButtonLink
                to={`/r/${community}/submit`}
                sx={{
                  ...callToActionStyles,
                  width: "100%",
                  textAlign: "center",
                }}
              >
                {t("createPost")}
              </ButtonLink>
            )}
          </Stack>
        </Stack>
      </SideCard>
      <CommunityRules community={community} />
      {show_description && (
        <SideCard>
          <Stack space={3}>
            <h2 sx={{ fontWeight: "600", fontSize: 2 }}>{t("sidebar")}</h2>
            <div
              dangerouslySetInnerHTML={{
                __html: sanitize(info?.data.description_html || ""),
              }}
            />
          </Stack>
        </SideCard>
      )}
    </Wrapper>
  ) : status === "loading" || status === "idle" ? (
    <Wrapper>
      <Skeleton as={SideCard} height={rem(150)} />
      <CommunityRules community={community} />
      <Skeleton as={SideCard} height={rem(150)} />
    </Wrapper>
  ) : (
    <Error />
  );
}
export default function CommunityInfo({ community }: { community: string }) {
  if (isCombinedCommunity(community)) return null;
  return <Content community={community} />;
}

function SideCard(props: ComponentProps<typeof Card>) {
  return <Card sx={{ width: "100%" }} {...props} />;
}

function JoinButton({
  user_is_subscriber,
  community,
  info,
}: {
  user_is_subscriber: boolean;
  community: string;
  info: { data: CommunityInfoData };
}) {
  const t = useTranslation();
  const [hover, setHover] = useState(false);
  const [colorMode] = useColorMode();
  const [subscribe] = useSubscribe({
    onMutate: ({ action }) => {
      const data = queryCache.getQueryData<{ data: CommunityInfoData }>([
        "about",
        community,
      ]);
      if (data) {
        queryCache.setQueryData(["about", community], {
          data: {
            ...data.data,
            user_is_subscriber: action === "sub",
          },
        });
      }
      const communitiesData = queryCache.getQueryData<
        { data: CommunityInfoData }[]
      >(["myCommunities"]);
      if (communitiesData) {
        const newData = communitiesData.slice();
        if (action === "sub") {
          newData.push(info);
        } else {
          const index = newData.findIndex(
            (x) => x.data.display_name === info.data.display_name
          );
          newData.splice(index, 1);
        }
        newData.sort((a, b) => b.data.subscribers - a.data.subscribers);
        queryCache.setQueryData(["myCommunities"], newData);
      }
      return () => {
        queryCache.setQueryData(["about", community], data);
        queryCache.setQueryData(["myCommunities"], communitiesData);
      };
    },
    onSuccess: () => {
      queryCache.invalidateQueries(["about", community]);
      queryCache.invalidateQueries("myCommunities");
    },
    onError: (_error, _action, rollback: any) => {
      rollback();
    },
  });
  return user_is_subscriber ? (
    <Button
      sx={{ width: "100%", ...(colorMode === "deep" && outlineStyles) }}
      onMouseEnter={() => {
        setHover(true);
      }}
      onTouchStart={() => {
        setHover(true);
      }}
      onTouchEnd={() => {
        setHover(false);
      }}
      onMouseOut={() => {
        setHover(false);
      }}
      onClick={() => {
        subscribe({ action: "unsub", communities: [community] });
      }}
    >
      {hover ? t("leave") : t("joined")}
    </Button>
  ) : (
    <Button
      sx={{ width: "100%", ...callToActionStyles }}
      onClick={() => {
        subscribe({ action: "sub", communities: [community] });
      }}
    >
      {t("join")}
    </Button>
  );
}

function CommunityRules({ community }: { community: string }) {
  const { data: rules, status: rulesStatus } = useCommunityRules(community);
  const t = useTranslation();
  return rulesStatus === "loading" || rulesStatus === "idle" ? (
    <Skeleton as={SideCard} height={rem(150)} />
  ) : rulesStatus === "error" ? (
    <SideCard sx={{ height: rem(150) }} />
  ) : rules && rules.length !== 0 ? (
    <SideCard
      sx={{
        width: "100%",
      }}
    >
      <Stack space={3}>
        <h2 sx={{ fontWeight: "600", fontSize: 2 }}>{t("rules")}</h2>
        <Accordion
          collapsible
          sx={{
            width: "100%",
            "> * + * ": {
              mt: 2,
            },
          }}
        >
          {rules.map((rule, index) => (
            <AccordionItem key={index}>
              <AccordionButton
                sx={{ pl: 0, pr: 0, textAlign: "start", width: "100%" }}
              >
                <div sx={{ display: "flex" }}>
                  <div>{rule.short_name}</div>
                  <div sx={{ marginLeft: "auto" }} aria-hidden>
                    <FiChevronDown
                      aria-hidden
                      sx={{
                        color: "textSecondary",
                      }}
                    />
                  </div>
                </div>
              </AccordionButton>
              <AccordionPanel>
                <div
                  dangerouslySetInnerHTML={{
                    __html: sanitize(rule.description_html),
                  }}
                />
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </Stack>
    </SideCard>
  ) : null;
}

function Error() {
  return (
    <Wrapper>
      <SideCard sx={{ height: rem(150) }} />
      <SideCard sx={{ height: rem(150) }} />
    </Wrapper>
  );
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <Stack as="aside" space={3} sx={{ fontSize: 1 }}>
      {children}
    </Stack>
  );
}
