/** @jsx jsx */
import TextareaAutosize from "@material-ui/core/TextareaAutosize";
import { useState } from "react";
import { queryCache } from "react-query";
import { Card, jsx } from "theme-ui";
import { useLoginUrl, useSubmitComment } from "../api";
import { Type } from "../constants";
import { useAuthStatus } from "../contexts/authContext";
import { useTranslation } from "../i18n";
import { ID, PostData } from "../types";
import Button from "./Button";
import Stack from "./Stack";
import { textAreaStyles } from "../theme/theme";

export default function CommentForm({
  postId,
  commentsQueryKey,
  contentQueryKey,
}: {
  postId: ID;
  commentsQueryKey: any;
  contentQueryKey: any;
}) {
  const authStatus = useAuthStatus();
  const loginUrl = useLoginUrl();
  const [mutate] = useSubmitComment({
    onSuccess: (response) => {
      queryCache.setQueryData(commentsQueryKey, (data: any) => {
        const comment = response?.json?.data?.things?.[0];
        const comments = data.comments.slice();
        if (comment && comments) {
          return { comments: [comment, ...comments] };
        }
        return data;
      });
      queryCache.setQueryData(contentQueryKey, (data: PostData) => {
        return data?.num_comments != null
          ? { ...data, num_comments: data.num_comments + 1 }
          : data;
      });
      setValue("");
    },
  });
  const t = useTranslation();
  const [value, setValue] = useState("");
  const isAuthenticated = authStatus === "success";
  return isAuthenticated ? (
    <Card sx={{ width: "100%", displat: "flex" }}>
      <Stack space={2}>
        <TextareaAutosize
          aria-label={t("commentForm.addAComment")}
          placeholder={t("commentForm.addAComment")}
          value={value}
          sx={textAreaStyles}
          onChange={(event) => setValue(event.target.value)}
        />
        <Button
          sx={{ marginLeft: "auto" }}
          onClick={() => {
            mutate({ parent: `${Type.Link}_${postId}`, text: value });
          }}
        >
          {t("commentForm.add")}
        </Button>
      </Stack>
    </Card>
  ) : (
    <Card
      as="a"
      sx={{
        width: "100%",
        displat: "flex",
        cursor: "pointer",
        textDecoration: "none",
        color: "text",
      }}
      href={loginUrl}
    >
      <Stack space={2}>
        <div sx={{ ...textAreaStyles, cursor: "pointer" }}>
          {t("commentForm.loginToComment")}
        </div>
        <Button aria-hidden as="div" sx={{ marginLeft: "auto" }}>
          {t("commentForm.add")}
        </Button>
      </Stack>
    </Card>
  );
}
