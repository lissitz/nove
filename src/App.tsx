/** @jsx jsx */
import { Fragment } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { ReactQueryConfigProvider } from "react-query";
import { ReactQueryDevtools } from "react-query-devtools";
import { BrowserRouter } from "react-router-dom";
import { jsx, ThemeProvider } from "theme-ui";
import NavBar from "./components/NavBar";
import Stack from "./components/Stack";
import { AuthProvider } from "./contexts/authContext";
import { MediaQueryProvider } from "./contexts/MediaQueryContext";
import { ScrollProvider } from "./contexts/scrollContext";
import { useTranslation } from "./i18n";
import Router from "./router";
import BaseStyles from "./styles/base";
import "./styles/normalize.css";
import { theme } from "./theme/theme";

if (window?.history?.scrollRestoration) {
  window.history.scrollRestoration = "manual";
}
function App() {
  return (
    <Fragment>
      <ThemeProvider theme={theme}>
        <ReactQueryConfigProvider
          config={{
            refetchAllOnWindowFocus: false,
            refetchOnMount: false,
          }}
        >
          <MediaQueryProvider>
            <HelmetProvider>
              <BrowserRouter
                //@ts-ignore
                timeoutMs={100}
              >
                <ScrollProvider>
                  <AuthProvider>
                    <Base />
                  </AuthProvider>
                </ScrollProvider>
              </BrowserRouter>
            </HelmetProvider>
          </MediaQueryProvider>
        </ReactQueryConfigProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={true} />
    </Fragment>
  );
}

function Base() {
  const t = useTranslation();
  return (
    <Fragment>
      <BaseStyles />
      <Helmet titleTemplate="%s | Nove" defaultTitle="Nove">
        <html lang="en" />
        <meta name="description" content={t("meta.description")} />
      </Helmet>
      <div
        sx={{
          display: "flex",
          bg: "background",
        }}
      >
        <Stack
          sx={{
            width: "100%",
          }}
        >
          <Router />
        </Stack>
      </div>
    </Fragment>
  );
}

export default App;
