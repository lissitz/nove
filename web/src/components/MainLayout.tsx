/** @jsx jsx */
import { jsx } from "theme-ui";
import { Column, Columns } from "../components/Columns";
import rem from "../utils/rem";
import { useIsDesktop } from "../contexts/MediaQueryContext";

export default function MainLayout({ ...rest }: { className?: string; [key: string]: any }) {
  return <Columns space={3} sx={{ px: [null, null, 2] }} {...rest} />;
}

export function Start(props: React.ComponentProps<typeof Column>) {
  const isDesktop = useIsDesktop();
  return isDesktop ? (
    <Column
      sx={{
        flex: "1 0 auto",
        width: rem(192),
        position: "sticky",
        top: 6,
        alignSelf: "start",
      }}
      {...props}
    />
  ) : null;
}

export function Mid(props: React.ComponentProps<typeof Column>) {
  return (
    <Column
      sx={{
        flex: "1 1 auto",
        //prevents children from overflowing it
        minWidth: 0,
      }}
      {...props}
    />
  );
}

export function End(props: React.ComponentProps<typeof Column>) {
  const isDesktop = useIsDesktop();
  return isDesktop ? (
    <Column
      sx={{
        flex: "1 0 auto",
        width: rem(300),
      }}
      {...props}
    />
  ) : null;
}
