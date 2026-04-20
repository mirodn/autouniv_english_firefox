import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import persister from "@/utils/persister";
import LoadingIndicator from "@/popup/components/LoadingIndicator/LoadingIndicator";
import App from "@/popup/app";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "jotai";
import { Global } from "@emotion/react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "@/styles/theme";
import GlobalStyle from "@/styles/global";
import { AxiosError } from "axios";
import { enableMapSet } from "immer";

const rootElement = document.querySelector("#root");
if (!rootElement) {
  throw new Error("Failed to find the root element");
}

if (process.env.NODE_ENV === "production") {
  // Sentry SDK가 MV3 환경이나 특정 에러 객체 직렬화 시 자체 크래시를 내는 문제가 있어 비활성화합니다.
}

enableMapSet();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24,
      staleTime: 1000 * 60 * 60 * 24,
      suspense: true,
      retry: (failureCount, error) => {
        if ((error as AxiosError).response?.status === 401) return false;
        return failureCount < 3;
      },
    },
  },
});

const root = createRoot(rootElement);
root.render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24,
        buster: "auth-cache-v2",
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => query.state.status === "success",
        },
      }}
    >
      <Provider>
        <Global styles={GlobalStyle} />
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <MemoryRouter>
            <Suspense fallback={<LoadingIndicator />}>
              <App />
            </Suspense>
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    </PersistQueryClientProvider>
  </StrictMode>
);
