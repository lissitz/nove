/** @jsx jsx */
import * as React from "react";
import { Helmet } from "react-helmet-async";
import { FiSettings } from "react-icons/fi";
import { Card, jsx } from "theme-ui";
import { Column, Columns } from "../components/Columns";
import LanguageListbox from "../components/LanguageListbox";
import MainLayout, { End, Mid, Start } from "../components/MainLayout";
import NavBar from "../components/NavBar";
import Stack from "../components/Stack";
import { useTranslation } from "../i18n";
import { maxWidth } from "../styles/base";
import rem from "../utils/rem";

export default function Settings() {
  const t = useTranslation();
  const title = t("appSettings");
  const languageLabelId = "language-label";
  return (
    <React.Fragment>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <NavBar />
      <div sx={{ width: "100%", flex: "1 1 auto" }}>
        <Stack space={[0, null, 4]} sx={{ height: "100%" }}>
          <div sx={{ height: [null, null, rem(64)] }} />
          <div
            sx={{
              maxWidth: "100%",
              width: maxWidth,
              margin: "0 auto",
              height: "100%",
            }}
          >
            <MainLayout as="main">
              <Start></Start>
              <Mid>
                <Card>
                  <Stack space={4}>
                    <div sx={{ display: "flex", height: "100%" }}>
                      <h1 sx={{ mt: "auto", fontSize: 3 }}>
                        <FiSettings sx={{ verticalAlign: "middle", mr: 3 }} />
                        {title}
                      </h1>
                    </div>
                    <Stack space={3} sx={{ width: "100%" }}>
                      <Columns
                        space={2}
                        sx={{
                          justifyContent: "space-between",
                          width: "100%",
                          alignItems: "center",
                        }}
                      >
                        <Column sx={{ width: "auto" }} id={languageLabelId}>
                          {t("settings.UILanguage")}
                        </Column>
                        <Column sx={{ width: "auto" }}>
                          <LanguageListbox labelId={languageLabelId} />
                        </Column>
                      </Columns>
                    </Stack>
                  </Stack>
                </Card>
              </Mid>
              <End></End>
            </MainLayout>
          </div>
        </Stack>
      </div>
    </React.Fragment>
  );
}
