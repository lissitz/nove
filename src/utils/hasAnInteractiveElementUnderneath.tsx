import * as React from "react";
const interactiveElements = ["A", "BUTTON", "VIDEO", "TEXTAREA"];
export function hasAnInteractiveElementUnderneath(
  event: React.MouseEvent<HTMLDivElement, globalThis.MouseEvent>
) {
  return event.nativeEvent.composedPath?.()?.find((x) =>
    interactiveElements.includes(
      //we are targeting HTMLEvents so I think this cast shouldn't be a problem
      (x as HTMLElement).tagName
    )
  );
}
