/** @jsx jsx */
import TextareaAutosize from "@material-ui/core/TextareaAutosize";
import { useReducer, useEffect, useState } from "react";
import { useNavigate } from "../router";
import { Card, Checkbox, jsx, Label } from "theme-ui";
import { useSubmitPost } from "../api";
import { useTranslation } from "../i18n";
import rem from "../utils/rem";
import Button from "./Button";
import { Inline, Inlines } from "./Inline";
import Stack from "./Stack";
import { Tabs, TabList, Tab, TabPanel, TabPanels } from "./Tabs";
import { Column, Columns } from "./Columns";
import { postKind } from "../constants";
import { PostKind } from "../types";

const initialState = {
  title: "",
  text: "",
  oc: false,
  spoiler: false,
  nsfw: false,
};
type State = typeof initialState;
export default function PostForm({
  storageKey,
  community,
}: {
  storageKey: string;
  community: string;
}) {
  const t = useTranslation();
  const [tabIndex, setTabIndex] = useState(0);
  return (
    <Tabs
      index={tabIndex}
      onChange={(index) => {
        setTabIndex(index);
      }}
    >
      <Stack space={2} sx={{ width: "100%" }}>
        <Columns as={TabList} space={2} sx={{ width: "100%" }}>
          {
            //[t("Post"), t("Link"), t("Image"), t("Video"), t("GIF")].map((text, i) => (
            [t("Post"), t("Link")].map((text, i) => (
              <Column>
                <Tab index={i}>{text}</Tab>
              </Column>
            ))
          }
        </Columns>
        <TabPanels sx={{ width: "100%" }}>
          {Array(5)
            .fill(undefined)
            .map((_, i) => (
              <TabPanel>
                <Form
                  storageKey={storageKey + i.toString()}
                  kind={postKind[i]}
                  community={community}
                />
              </TabPanel>
            ))}
        </TabPanels>
      </Stack>
    </Tabs>
  );
}

function Form({
  storageKey,
  kind,
  community,
}: {
  storageKey: string;
  kind: PostKind;
  community: string;
}) {
  const t = useTranslation();
  const [mutate] = useSubmitPost({
    onSuccess: (response, variables) => {
      if (response.success) {
        dispatch({ ...initialState });
        navigate(`/r/${community}`);
      } else {
        console.error(response.jquery);
      }
    },
  });
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(
    (state: State, action: Partial<State>) => ({ ...state, ...action }),
    initialState,
    (): State => {
      try {
        const sessionStorageValue = sessionStorage.getItem(storageKey);
        let state = JSON.parse(sessionStorageValue || "null") || initialState;
        return state;
      } catch {
        return initialState;
      }
    }
  );
  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(state));
    } catch {}
  }, [storageKey, state]);
  const handleCheckboxChange = (key: keyof State) => (event: React.ChangeEvent<HTMLInputElement>) =>
    dispatch({ [key]: event.target.checked });
  const { title, text, nsfw, oc, spoiler } = state;
  return (
    <Card sx={{ width: "100%", display: "flex" }}>
      <Stack space={2} sx={{ width: "100%" }}>
        <TextareaAutosize
          aria-label={t("postForm.title")}
          placeholder={t("postForm.title")}
          rows={1}
          maxLength={300}
          value={title}
          sx={{ ...textAreaStyles, minHeight: rem(37) }}
          onChange={(event) => dispatch({ title: event.target.value })}
        />
        {kind === "self" ? (
          <TextareaAutosize
            aria-label={t("postForm.textOptional")}
            placeholder={t("postForm.textOptional")}
            value={text}
            sx={{ ...textAreaStyles, minHeight: rem(64) }}
            onChange={(event) => dispatch({ text: event.target.value })}
          />
        ) : kind === "link" ? (
          <TextareaAutosize
            aria-label={t("postForm.link")}
            placeholder={t("postForm.link")}
            value={text}
            sx={{ ...textAreaStyles, minHeight: rem(64) }}
            onChange={(event) => dispatch({ text: event.target.value })}
          />
        ) : null}
        <Inlines space={3}>
          {/*
          <Inline>
            <Label>
              <Checkbox checked={oc} onChange={handleCheckboxChange("oc")} />
              {t("postForm.oc")}
            </Label>
          </Inline>
          */}
          <Inline>
            <Label>
              <Checkbox checked={spoiler} onChange={handleCheckboxChange("spoiler")} />
              {t("postForm.spoiler")}
            </Label>
          </Inline>
          <Inline>
            <Label>
              <Checkbox checked={nsfw} onChange={handleCheckboxChange("nsfw")} />
              {t("postForm.nsfw")}
            </Label>
          </Inline>
        </Inlines>
        <div sx={{ display: "flex", width: "100%", "> * + *": { ml: 2 } }}>
          <Button
            sx={{ ml: "auto" }}
            onClick={() => {
              dispatch({ ...initialState });
              navigate(-1);
            }}
          >
            {t("postForm.cancel")}
          </Button>
          <Button
            onClick={() => {
              mutate({
                kind,
                nsfw,
                ...(kind === "self" && { text }),
                ...(kind === "link" && { url: text }),
                title,
                spoiler,
                sr: community,
              });
            }}
          >
            {t("postForm.post")}
          </Button>
        </div>
      </Stack>
    </Card>
  );
}

const textAreaStyles = {
  border: "none",
  bg: "background",
  width: "100%",
  p: 2,
  fontSize: 1,
  borderRadius: 4,
  resize: "vertical",

  //just to remove the vertical-align:baseline of the default display:inline-block that adds space at the bottom
  display: "block",
};
