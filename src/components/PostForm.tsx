/** @jsx jsx */
import TextareaAutosize from "@material-ui/core/TextareaAutosize";
import { useEffect, useReducer, useState } from "react";
import { Card, Checkbox, jsx, Label } from "theme-ui";
import { useSubmitPost } from "../api";
import { postKind } from "../constants";
import { useTranslation } from "../i18n";
import { useNavigate } from "../router";
import { textAreaStyles } from "../theme/theme";
import { PostKind } from "../types";
import rem from "../utils/rem";
import Button from "./Button";
import { Column, Columns } from "./Columns";
import { Inline, Inlines } from "./Inline";
import Stack from "./Stack";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "./Tabs";

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
          {[t("postForm.type.post"), t("postForm.type.link")].map((text, i) => (
            <Column>
              <Tab index={i}>{text}</Tab>
            </Column>
          ))}
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
  const handleCheckboxChange = (key: keyof State) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => dispatch({ [key]: event.target.checked });
  const { title, text, nsfw, spoiler } = state;
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
            sx={textAreaStyles}
            onChange={(event) => dispatch({ text: event.target.value })}
          />
        ) : kind === "link" ? (
          <TextareaAutosize
            aria-label={t("postForm.type.link")}
            placeholder={t("postForm.type.link")}
            value={text}
            sx={textAreaStyles}
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
              <Checkbox
                checked={spoiler}
                onChange={handleCheckboxChange("spoiler")}
              />
              {t("postForm.spoiler")}
            </Label>
          </Inline>
          <Inline>
            <Label>
              <Checkbox
                checked={nsfw}
                onChange={handleCheckboxChange("nsfw")}
              />
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
