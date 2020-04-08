import { theme } from "../theme/theme";
import { headerHeight } from "../constants";

export default function commentsScrollPosition() {
  const margin = theme.space[4];
  const comments =
    document.getElementById("comments")!.getBoundingClientRect().top +
    window.scrollY -
    headerHeight -
    remToPx(margin);
  const scroll = { x: 0, y: comments };
  return scroll;
}

function remToPx(rem: string) {
  return Number(rem.slice(0, -3)) / 0.0625;
}
