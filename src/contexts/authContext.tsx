import * as React from "react";
import { useCallback, useContext, useEffect, useReducer, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "../router";
import { fetchJson } from "../utils/fetch";

const AuthContext = React.createContext<AuthState>({
  status: "pending",
});
const AuthDispatchContext = React.createContext<React.Dispatch<AuthEvent> | null>(null);

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
export type AuthStatus = "pending" | "error" | "success" | "unitialized";

type AuthState = {
  status: AuthStatus;
  expirationDate?: number;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
};
type AuthEvent =
  | {
      status: "signout";
    }
  | {
      status: "expired";
    }
  | {
      status: "pending";
    }
  | {
      status: "error";
    }
  | {
      status: "unitialized";
    }
  | {
      status: "declined";
    }
  | {
      status: "auth_success";
      accessToken: string;
      refreshToken: string;
      expirationDate: number;
      expiresIn: number;
    }
  | {
      status: "refresh_success";
      accessToken: string;
      expirationDate: number;
      expiresIn: number;
    };
function reducer(state: AuthState, event: AuthEvent): AuthState {
  console.log(state, event);
  switch (event.status) {
    case "auth_success": {
      return {
        status: "success",
        expirationDate: event.expirationDate,
        accessToken: event.accessToken,
        refreshToken: event.refreshToken,
        expiresIn: event.expiresIn,
      };
    }
    case "refresh_success": {
      return {
        status: "success",
        expirationDate: event.expirationDate,
        accessToken: event.accessToken,
        expiresIn: event.expiresIn,
      };
    }
    case "pending": {
      return event;
    }
    case "expired":
    case "declined":
    case "signout":
    case "unitialized": {
      return { status: "unitialized" };
    }
  }
  return event;
}
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [params] = useSearchParams();
  const key = "nove_state";
  const initialValue = { status: "pending" } as const;
  const [authState, dispatch] = useReducer(
    reducer,
    initialValue,
    (): AuthState => {
      try {
        const sessionStorageValue = sessionStorage.getItem(key);
        let state = JSON.parse(sessionStorageValue || "null") || initialValue;
        if (state.status === "unitialized") {
          state = { status: "pending" };
        }
        return state;
      } catch {
        return initialValue;
      }
    }
  );
  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify({ ...authState, refreshToken: "" }));
    } catch {}
  }, [authState]);

  const navigate = useNavigate();

  //avoids double request to access_token which results in error.
  const isFetching = useRef(false);
  const epsilon = 120000;
  useEffect(() => {
    if (authState?.expirationDate && authState.expirationDate < Date.now() + epsilon) {
      dispatch({ status: "expired" });
    }
    const code = params.get("code");
    const error = params.get("error");
    const state = params.get("state");
    const redirect_uri = process.env.REACT_APP_REDDIT_REDIRECT_URI;
    if (!error && state && !isFetching.current) {
      isFetching.current = true;
      fetchJson("https://www.reddit.com/api/v1/access_token", {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: "Basic " + btoa(`${process.env.REACT_APP_REDDIT_CLIENT_ID}:`),
        },
        method: "POST",
        body: `grant_type=authorization_code&code=${code}&redirect_uri=${redirect_uri}`,
      })
        .then((x: any) => {
          if (x.error) {
            throw new Error(x.error);
          } else return x;
        })
        .then((x: AuthResponse) => {
          dispatch({
            status: "auth_success",
            accessToken: x.access_token,
            refreshToken: x.refresh_token,
            expiresIn: x.expires_in,
            expirationDate: Date.now() + x.expires_in * 1000,
          });
          isFetching.current = true;
        })
        .catch((err) => {
          dispatch({ status: "error" });
          isFetching.current = false;
        });
      navigate("/");
    }
    if (authState.status === "pending" && !code && !error && !state && !isFetching.current) {
      dispatch({ status: "unitialized" });
    }
    if (error) {
      dispatch({ status: "declined" });
    }
  }, [params, authState, navigate]);

  const refreshToken = authState.refreshToken;
  useInterval(
    () => {
      if (refreshToken) {
        fetchJson("https://www.reddit.com/api/v1/access_token", {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: "Basic " + btoa(`${process.env.REACT_APP_REDDIT_CLIENT_ID}:`),
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
              status: "refresh_success",
              accessToken: x.access_token,
              expiresIn: x.expires_in,
              expirationDate: Date.now() + x.expires_in * 1000,
            });
          })
          .catch((_) => {
            dispatch({ status: "expired" });
          });
      } else {
        dispatch({ status: "expired" });
      }
    },
    authState.expiresIn ? authState.expiresIn * 1000 - epsilon : null
  );

  return (
    <AuthDispatchContext.Provider value={dispatch}>
      <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>
    </AuthDispatchContext.Provider>
  );
}

export function useAccessToken() {
  return useContext(AuthContext).accessToken;
}
export function useIsAuthenticated() {
  return useContext(AuthContext).status === "success";
}

export function useAuthStatus() {
  return useContext(AuthContext).status;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function useLogOut() {
  const dispatch = useContext(AuthDispatchContext);
  const logOut = useCallback(() => dispatch && dispatch({ status: "signout" }), [dispatch]);
  if (!dispatch) throw new Error("useSignOut must be used inside a AuthDispatchContext Provider");
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
