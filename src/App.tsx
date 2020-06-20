/** @jsx jsx */
import { Fragment, useRef, useEffect } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { ReactQueryConfigProvider } from "react-query";
import { ReactQueryDevtools } from "react-query-devtools";
import { BrowserRouter } from "react-router-dom";
import { jsx, ThemeProvider } from "theme-ui";
import Stack from "./components/Stack";
import { AuthProvider } from "./contexts/authContext";
import { MediaQueryProvider } from "./contexts/MediaQueryContext";
import { useTranslation, LanguageProvider } from "./i18n";
import Router from "./router";
import BaseStyles from "./styles/base";
import "./styles/normalize.css";
import { theme } from "./theme/theme";
import { useLocation } from "react-router";

function App() {
  return (
    <Fragment>
      <ThemeProvider theme={theme}>
        <ReactQueryConfigProvider
          config={{
            refetchAllOnWindowFocus: false,
            refetchOnMount: false,
            staleTime: 0,
          }}
        >
          <LanguageProvider>
            <MediaQueryProvider>
              <HelmetProvider>
                <BrowserRouter>
                  <AuthProvider>
                    <Base />
                  </AuthProvider>
                </BrowserRouter>
              </HelmetProvider>
            </MediaQueryProvider>
          </LanguageProvider>
        </ReactQueryConfigProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={true} />
    </Fragment>
  );
}

function Base() {
  const t = useTranslation();
  useScrollTopTopOnNewRoute();
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

          "*": {
            //firefox
            scrollbarWidth: "thin",
            scrollbarColor: (theme: any) =>
              `${theme.colors.textSecondary} rgba(0, 0, 0, 0.1)`,

            "&::-webkit-scrollbar": {
              width: 5,
              height: 5,
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "textSecondary",
              borderRadius: 4,
            },
            "&::-webkit-scrollbar-track": {
              borderRadius: 4,
              bg: "rgba(0, 0, 0, 0.1)",
            },
          },
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

function useScrollTopTopOnNewRoute() {
  const location = useLocation();
  const keyStore = useRef(new Set());
  useEffect(() => {
    if (!keyStore.current.has(location.key)) {
      window.scrollTo({ top: 0 });
      keyStore.current.add(location.key);
    }
  }, [location]);
}

export default App;
