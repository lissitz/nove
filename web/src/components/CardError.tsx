/** @jsx jsx */
import { Card, jsx } from "theme-ui";
import { useTranslation } from "../i18n";
import rem from "../utils/rem";

export default function CardError({ height = rem(200) }: { height?: number | string }) {
  const t = useTranslation();
  return (
    <Card
      sx={{
        position: "relative",
        width: "100%",
        height,
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        sx={{
          textAlign: "center",
          color: "textSecondary",
          fontWeight: "600",
          width: "100%",
          fontSize: 3,
        }}
      >
        {t("error.serverConnection")}
      </div>
    </Card>
  );
}
