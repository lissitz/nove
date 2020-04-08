/** @jsx jsx */
import * as React from "react";
import { Fragment } from "react";
import { jsx } from "theme-ui";
import { Tabs as ReachTabs, Tab as ReachTab } from "@reach/tabs";
import "@reach/tooltip/styles.css";
import { Global, css } from "@emotion/core";
import { theme } from "../theme/theme";
import Button from "./Button";

function Tabs(props: React.ComponentProps<typeof ReachTabs>) {
  return (
    <Fragment>
      <Global
        styles={css`
          :root {
            --reach-tabs: 1;
          }

          [data-reach-tabs][data-orientation="vertical"] {
            display: flex;
          }

          [data-reach-tab-list] {
            display: flex;
          }

          [data-reach-tab-list][aria-orientation="vertical"] {
            flex-direction: column;
          }

          [data-reach-tab] {
            display: inline-block;
            border: none;
            padding: 0.25em 0.5em;
            margin: 0;
            background: none;
            color: inherit;
            font: inherit;
            cursor: pointer;
            -webkit-appearance: none;
            -moz-appearance: none;
            width: 100%;
            background: "secondary";
          }

          [data-reach-tab]:active {
          }

          [data-reach-tab]:disabled {
            opacity: 0.25;
            cursor: default;
          }

          [data-reach-tab][data-selected] {
          }
        `}
      />
      <ReachTabs {...props} />
    </Fragment>
  );
}

function Tab(props: React.ComponentProps<typeof ReachTab>) {
  return <ReachTab {...props} as={Button} />;
}
export { Tabs, Tab };
export { TabList, TabPanels, TabPanel } from "@reach/tabs";
