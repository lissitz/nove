import * as React from "react";
import { useContext, useEffect, useReducer } from "react";
import { useLocation } from "react-router";
import useDifferent from "../hooks/useDifferent";

const ScrollContext = React.createContext<ScrollState>({});
const ScrollDispatchContext = React.createContext<React.Dispatch<
  ScrollEvent
> | null>(null);

type ScrollState = {
  [key: string]: { x: number; y: number };
};
type ScrollEvent = ScrollState;

function reducer(state: ScrollState, action: ScrollEvent): ScrollState {
  const value = Object.values(action)[0];
  if (value.x === 0 && value.y === 0) {
    return state;
  }
  return { ...state, ...action };
}
export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const key = "nove_state_scroll";
  const initialValue = {};
  const [state, dispatch] = useReducer(
    reducer,
    initialValue,
    (): ScrollState => {
      try {
        const sessionStorageValue = sessionStorage.getItem(key);
        let state = JSON.parse(sessionStorageValue || "null") || initialValue;
        return state;
      } catch {
        return initialValue;
      }
    }
  );
  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [state]);

  const location = useLocation();
  const prevLocation = useDifferent(location) || location;
  useEffect(() => {
    if (window) {
      window.onpopstate = function (event: PopStateEvent) {
        dispatch({ [location.key]: { x: window.scrollX, y: window.scrollY } });
      };
    }
  }, [location]);
  useEffect(() => {
    if (prevLocation.key !== location.key) {
      const entry = state[location.key];
      if (entry) {
        window.scroll({ top: entry.y, left: entry.x });
        //@ts-ignore
        //allow a link or navigate to set the initial scroll of the linked page.
      } else if (location.state?.scroll) {
        //@ts-ignore
        const entry = location.state?.scroll;
        window.scroll({ top: entry.y, left: entry.x });
      } else {
        window.scroll({ top: 0, left: 0 });
      }
    }
  }, [prevLocation.key, location.key, state, location.state]);
  return (
    <ScrollDispatchContext.Provider value={dispatch}>
      <ScrollContext.Provider value={state}>{children}</ScrollContext.Provider>
    </ScrollDispatchContext.Provider>
  );
}

export function useScrollDict() {
  const context = useContext(ScrollContext);
  if (!context)
    throw new Error("Must be used useScrollDict inside a ScrollProvider");
  return context;
}
export function useDispatchScroll() {
  const context = useContext(ScrollDispatchContext);
  if (!context)
    throw new Error("Must be used useDispatchScroll inside a ScrollProvider");
  return context;
}
