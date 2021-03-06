/** @jsx jsx */
import { Fragment, useRef, useEffect } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { ReactQueryConfigProvider } from "react-query";
import { ReactQueryDevtools } from "react-query-devtools";
import { BrowserRouter } from "react-router-dom";
import { jsx, ThemeProvider, useThemeUI } from "theme-ui";
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
            queries: {
              refetchOnWindowFocus: false,
              refetchOnMount: false,
              staleTime: 0,
            },
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
  useScrollTopTopOnNewRoute();
  return (
    <Fragment>
      <BaseStyles />
      <BaseHelmet />
      <div
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          bg: "background",
        }}
      >
        <Router />
      </div>
    </Fragment>
  );
}

function BaseHelmet() {
  const { theme } = useThemeUI();
  const t = useTranslation();
  return (
    <Helmet titleTemplate="%s | Nove" defaultTitle="Nove">
      <html lang="en" />
      <meta name="description" content={t("meta.description")} />
      <meta name="theme-color" content={theme.colors.surface} />
    </Helmet>
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
