//https://www.reddit.com/r/reactjs/about.json
/** @jsx jsx */
import { Accordion, AccordionButton, AccordionItem, AccordionPanel } from "@reach/accordion";
import * as React from "react";
import { ComponentProps, Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { FiChevronDown } from "react-icons/fi";
import { queryCache } from "react-query";
import { Card, jsx, useColorMode } from "theme-ui";
import { useCommunityInfo, useCommunityRules, useSubscribe } from "../api";
import { useIsAuthenticated } from "../contexts/authContext";
import { useTranslation } from "../i18n";
import type { CommunityInfoData } from "../types";
import { formatQuantity, sanitize } from "../utils/format";
import rem from "../utils/rem";
import Button, { callToActionStyles, outlineStyles } from "./Button";
import ButtonLink from "./ButtonLink";
import Skeleton from "./Skeleton";
import Stack from "./Stack";
import { useLocation } from "react-router-dom";
import VisuallyHidden from "@reach/visually-hidden";

const show_description = false;
function Success({ community }: { community: string }) {
  let { data: info } = useCommunityInfo(community);
  info = info!;
  const t = useTranslation();
  const isAuthenticated = useIsAuthenticated();
  const location = useLocation();
  return (
    <Wrapper>
      <SideCard>
        <Stack space={4}>
          <Stack space={2}>
            <div sx={{ fontWeight: "600", fontSize: 2 }}>{t("about")}</div>
            <div
              dangerouslySetInnerHTML={{
                __html: sanitize(info.data.public_description_html || ""),
              }}
            />
            <div>
              <span sx={{ fontWeight: "600" }}>{formatQuantity(info.data.subscribers, t)}</span>
              {" " + t("subscribers")}
            </div>
            <div>
              {t("created") + " "}
              <span sx={{ fontWeight: "600" }}>
                {new Date(info.data.created_utc * 1000).toLocaleDateString("en-US")}
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
                sx={{ ...callToActionStyles, width: "100%", textAlign: "center" }}
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
            <div sx={{ fontWeight: "600", fontSize: 2 }}>{t("sidebar")}</div>
            <div
              dangerouslySetInnerHTML={{
                __html: sanitize(info?.data.description_html || ""),
              }}
            />
          </Stack>
        </SideCard>
      )}
    </Wrapper>
  );
}
export default function CommunityInfo({ community }: { community: string }) {
  if (community === "all" || community === "popular") return null;
  return (
    <ErrorBoundary FallbackComponent={Error}>
      <Suspense
        fallback={
          <Wrapper>
            <Skeleton as={SideCard} height={rem(150)} />
            <CommunityRules community={community} />
            <Skeleton as={SideCard} height={rem(150)} />
          </Wrapper>
        }
      >
        <Success community={community} />
      </Suspense>
    </ErrorBoundary>
  );
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
      const data = queryCache.getQueryData(["about", community]) as any;
      if (data) {
        queryCache.setQueryData(["about", community], {
          kind: data.kind,
          data: {
            ...data.data,
            user_is_subscriber: action === "sub",
          },
        });
      }
      const communitiesData = queryCache.getQueryData(["myCommunities"]) as any;
      if (communitiesData) {
        const newData = communitiesData.slice();
        if (action === "sub") {
          newData.push(info);
        } else {
          const index = newData.findIndex(
            (x: any) => x.data.display_name === info.data.display_name
          );
          newData.splice(index, 1);
        }
        newData.sort((a: any, b: any) => b.data.subscribers - a.data.subscribers);
        queryCache.setQueryData(["myCommunities"], newData);
      }
      return () => {
        queryCache.setQueryData(["about", community], data);
        queryCache.setQueryData(["myCommunities"], communitiesData);
      };
    },
    onSuccess: () => {
      queryCache.refetchQueries(["about", community]);
      queryCache.refetchQueries("myCommunities");
    },
    onError: (_error, _action, rollback: any) => {
      rollback();
    },
  });
  console.log(colorMode);
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
  return rulesStatus === "loading" ? (
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
        <div sx={{ fontWeight: "600", fontSize: 2 }}>{t("rules")}</div>
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
              <AccordionButton sx={{ pl: 0, pr: 0, textAlign: "start", width: "100%" }}>
                <div sx={{ display: "flex" }}>
                  <div>{rule.short_name}</div>
                  <VisuallyHidden>{" " + t("expandRule")}</VisuallyHidden>
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
