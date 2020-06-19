/** @jsx jsx */
import { TextareaAutosize } from "@material-ui/core";
import { useState } from "react";
import { jsx } from "theme-ui";
import { useTranslation } from "../i18n";
import { textAreaStyles } from "../theme/theme";
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
