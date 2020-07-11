import * as React from "react";
import { useCallback, useContext, useEffect, useReducer, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { fetchJson } from "../utils/fetch";
import { useSetToken, getToken, useRevokeToken, useDeleteToken } from "../api";
import {
  nove_auth_session_key,
  nove_auth_state_session_key,
} from "../constants";

type AuthResponse = {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
  scope: string;
  refresh_token: string;
};

type AuthRefreshResponse = {
  access_token: string;
  expires_in: number;
};

type AuthEvent =
  | {
      type: "login_declined";
    }
  | {
      type: "access_token_expired";
    }
  | {
      type: "tokens_retrieval_error";
    }
  | {
      type: "tokens_acquired";
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      expirationDate: number;
    }
  | {
      type: "access_token_refreshed";
      accessToken: string;
      expiresIn: number;
      expirationDate: number;
    }
  | {
      type: "access_token_retrieval_error";
    }
  | {
      type: "refresh_token_retrieved";
      refreshToken: string;
    }
  | {
      type: "refresh_token_retrieval_error";
    }
  | {
      type: "logout";
    };

type AuthState =
  | { status: "pending_tokens_retrieval"; code: string }
  | {
      status: "pending_access_token_retrieval";
      refreshToken: string;
      silent: boolean;
    }
  | {
      status: "pending_refresh_token_retrieval";
      //if silent is true don't display pending indicators
      silent: boolean;
    }
  | { status: "unauthenticated" }
  | {
      status: "authenticated";
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      expirationDate: number;
    };

const AuthContext = React.createContext<AuthState>({
  status: "unauthenticated",
});

const AuthDispatchContext = React.createContext<React.Dispatch<
  AuthEvent
> | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [params] = useSearchParams();
  const [state, dispatch] = useReducer(reducer, params, initialState);
  useAuthEffects(state, dispatch);
  return (
    <AuthDispatchContext.Provider value={dispatch}>
      <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
    </AuthDispatchContext.Provider>
  );
}

function reducer(state: AuthState, event: AuthEvent): AuthState {
  switch (state.status) {
    case "pending_tokens_retrieval":
      switch (event.type) {
        case "tokens_acquired":
          return {
            status: "authenticated",
            accessToken: event.accessToken,
            refreshToken: event.refreshToken,
            expiresIn: event.expiresIn,
            expirationDate: event.expirationDate,
          };
        case "tokens_retrieval_error":
          return { status: "unauthenticated" };
        default:
          return state;
      }
    case "pending_refresh_token_retrieval": {
      switch (event.type) {
        case "refresh_token_retrieval_error":
          return { status: "unauthenticated" };
        case "refresh_token_retrieved":
          return {
            status: "pending_access_token_retrieval",
            refreshToken: event.refreshToken,
            silent: state.silent,
          };
        default:
          return state;
      }
    }
    case "pending_access_token_retrieval": {
      switch (event.type) {
        case "access_token_retrieval_error":
          return { status: "unauthenticated" };
        case "access_token_refreshed":
          return {
            status: "authenticated",
            refreshToken: state.refreshToken,
            accessToken: event.accessToken,
            expiresIn: event.expiresIn,
            expirationDate: event.expirationDate,
          };
        default:
          return state;
      }
    }
    case "authenticated": {
      switch (event.type) {
        case "logout":
          return { status: "unauthenticated" };
        case "access_token_expired":
          return {
            status: "pending_access_token_retrieval",
            refreshToken: state.refreshToken,
            silent: true,
          };
        default:
          return state;
      }
    }
    case "unauthenticated": {
      return state;
    }
  }
}

function initialState(params: URLSearchParams): AuthState {
  const code = params.get("code");
  const error = params.get("error");
  const state = params.get("state");
  if (error) {
    return { status: "unauthenticated" };
  }
  if (code && state) {
    try {
      const stored_state = window.localStorage.getItem(
        nove_auth_state_session_key
      );
      if (stored_state === state) {
        return { status: "pending_tokens_retrieval", code };
      } else {
        return { status: "unauthenticated" };
      }
    } catch (error) {
      // if local storage is disabled we still let the user login
      return { status: "pending_tokens_retrieval", code };
    }
  }
  if (!code && !state) {
    let is_auth;
    try {
      const value = window.localStorage.getItem(nove_auth_session_key);
      is_auth = value ? value === "true" : undefined;
    } catch (error) {}
    if (is_auth) {
      return { status: "pending_refresh_token_retrieval", silent: false };
    } else {
      // Still try to refresh silently to acocunt for session storage
      // being blocked but cookies being allowed
    }
    return { status: "pending_refresh_token_retrieval", silent: true };
  }
  return { status: "unauthenticated" };
}

function useAuthEffects(state: AuthState, dispatch: (x: AuthEvent) => void) {
  const [setToken] = useSetToken();
  const navigate = useNavigate();

  const code = "code" in state && state.code;
  useEffect(() => {
    if (state.status === "pending_tokens_retrieval") {
      fetchJson("https://www.reddit.com/api/v1/access_token", {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " + btoa(`${process.env.REACT_APP_REDDIT_CLIENT_ID}:`),
        },
        method: "POST",
        body: `grant_type=authorization_code&code=${code}&redirect_uri=${process.env.REACT_APP_REDDIT_REDIRECT_URI}`,
      })
        .then((x: any) => {
          if (x.error) {
            throw new Error(x.error);
          } else return x;
        })
        .then((x: AuthResponse) => {
          dispatch({
            type: "tokens_acquired",
            accessToken: x.access_token,
            refreshToken: x.refresh_token,
            expiresIn: x.expires_in,
            expirationDate: Date.now() + x.expires_in * 1000,
          });
          setToken(x.refresh_token);
        })
        .catch((err) => {
          dispatch({ type: "tokens_retrieval_error" });
        });
      navigate("/");
    }
  }, [setToken, navigate, state.status, dispatch, code]);

  useEffect(() => {
    if (state.status === "pending_refresh_token_retrieval") {
      getToken()
        .then((x: { token: string }) => {
          dispatch({ type: "refresh_token_retrieved", refreshToken: x.token });
        })
        .catch((x) => {
          dispatch({ type: "refresh_token_retrieval_error" });
        });
    }
  }, [state.status, dispatch]);

  const refresh = useCallback(
    (refreshToken: string) => {
      fetchJson("https://www.reddit.com/api/v1/access_token", {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " + btoa(`${process.env.REACT_APP_REDDIT_CLIENT_ID}:`),
        },
        method: "POST",
        body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
      })
        .then((x: any) => {
          if (x.error) {
            throw new Error(x.error);
          } else return x;
        })
        .then((x: AuthRefreshResponse) => {
          dispatch({
            type: "access_token_refreshed",
            accessToken: x.access_token,
            expiresIn: x.expires_in,
            expirationDate: Date.now() + x.expires_in * 1000,
          });
        })
        .catch((_) => {
          dispatch({ type: "access_token_retrieval_error" });
        });
    },
    [dispatch]
  );

  const refreshToken = "refreshToken" in state && state.refreshToken;
  useEffect(() => {
    if (state.status === "pending_access_token_retrieval") {
      if (refreshToken) {
        refresh(refreshToken);
      }
    }
  }, [refresh, state.status, refreshToken]);

  const epsilon = 120000;
  useInterval(
    () => {
      if (refreshToken) {
        refresh(refreshToken);
      }
    },
    state.status === "authenticated" ? state.expiresIn * 1000 - epsilon : null
  );

  //check if token has expired after window focus
  const expirationDate = "expirationDate" in state && state.expirationDate;
  useEffect(() => {
    const handleFocus = () => {
      if (
        state.status === "authenticated" &&
        expirationDate &&
        expirationDate < Date.now() &&
        refreshToken
      )
        refresh(refreshToken);
    };
    window.addEventListener("visibilitychange", handleFocus, false);
    window.addEventListener("focus", handleFocus, false);
    return () => {
      window.removeEventListener("visibilitychange", handleFocus, false);
      window.removeEventListener("focus", handleFocus, false);
    };
  }, [state.status, expirationDate, refreshToken, refresh]);
}

export function useAccessToken() {
  const context = useContext(AuthContext);
  if (context.status === "authenticated") return context.accessToken;
}

export function useIsAuthenticated() {
  return useContext(AuthContext).status === "authenticated";
}

export function useIsPending() {
  const state = useContext(AuthContext);
  return (
    state.status === "pending_tokens_retrieval" ||
    (state.status === "pending_refresh_token_retrieval" && !state.silent) ||
    (state.status === "pending_access_token_retrieval" && !state.silent)
  );
}

export function useAuthStatus() {
  return useContext(AuthContext).status;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function useLogOut() {
  const [revokeToken] = useRevokeToken();
  const [deleteToken] = useDeleteToken();
  const state = useAuth();
  const dispatch = useContext(AuthDispatchContext);
  const accessToken =
    state.status === "authenticated" ? state.accessToken : undefined;
  const refreshToken =
    state.status === "authenticated" ? state.refreshToken : undefined;
  const isAuthenticated = state.status === "authenticated";
  const logOut = useCallback(() => {
    if (isAuthenticated) {
      dispatch && dispatch({ type: "logout" });
      accessToken &&
        revokeToken({ token: accessToken, token_type_hint: "access_token" });
      if (refreshToken) {
        revokeToken({
          token: refreshToken,
          token_type_hint: "refresh_token",
        });
        deleteToken();
      }
    }
  }, [
    isAuthenticated,
    dispatch,
    accessToken,
    revokeToken,
    refreshToken,
    deleteToken,
  ]);
  if (!dispatch)
    throw new Error(
      "useLogOut must be used inside a AuthDispatchContext Provider"
    );
  return logOut;
}

function useInterval(callback: Function, delay: number | null) {
  const savedCallback = useRef<Function | undefined>();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current?.();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
