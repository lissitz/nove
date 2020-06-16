/** @jsx jsx */
import { TextareaAutosize } from "@material-ui/core";
import { useState } from "react";
import { jsx } from "theme-ui";
import { useTranslation } from "../i18n";
import rem from "../utils/rem";
import Button from "./Button";
import Stack from "./Stack";

export default function TextEditor({
  text: initialText,
  onCancel,
  onEdit,
}: {
  text: string;
  onCancel: () => void;
  onEdit: ({ text }: { text: string }) => void;
}) {
  const [text, setText] = useState(initialText);
  const t = useTranslation();
  return (
    <Stack space={2} sx={{ width: "100%" }}>
      <TextareaAutosize
        value={text}
        sx={textAreaStyles}
        onChange={(event: any) => setText(event.target.value)}
      />
      <div sx={{ display: "flex", width: "100%", "> * + *": { ml: 2 } }}>
        <Button
          sx={{ ml: "auto" }}
          onClick={() => {
            onCancel();
          }}
        >
          {t("textEditor.cancel")}
        </Button>
        <Button
          sx={{}}
          onClick={() => {
            onEdit({ text });
          }}
        >
          {t("textEditor.submit")}
        </Button>
      </div>
    </Stack>
  );
}
const textAreaStyles = {
  border: "none",
  bg: "gray.1",
  width: "100%",
  minHeight: rem(64),
  p: 2,
  fontSize: 1,
  borderRadius: 4,
  resize: "vertical",

  //just to remove the vertical-align:baseline of the default display:inline-block that adds space at the bottom
  display: "block",
};
