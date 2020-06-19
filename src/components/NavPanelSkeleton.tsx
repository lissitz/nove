/** @jsx jsx */
import { jsx } from "theme-ui";
import Button from "./Button";
import Skeleton from "./Skeleton";
import Stack from "./Stack";
import { useTranslation } from "../i18n";
import rem from "../utils/rem";

const height = rem(32);
export default function MyCommunitiesSkeleton() {
  const t = useTranslation();
  return (
    <Stack space={2} sx={{ width: "100%" }}>
      <div sx={{ fontWeight: "600", color: "transparent" }}>
        {t("myCommunities")}
      </div>
      <Stack
        as="ul"
        asChild="li"
        space={2}
        sx={{
          width: "100%",
        }}
      >
        {Array(5)
          .fill(undefined)
          .map((_, index) => (
            <Skeleton
              key={index}
              as={ButtonSkeleton}
              sx={{ bg: "gray.0" }}
              height={height}
            />
          ))}
      </Stack>
    </Stack>
  );
}

function ButtonSkeleton() {
  return <Button as="div" sx={{ height }} />;
}
