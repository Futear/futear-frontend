// components/games/top/index.js

import TopPlayingScreen from "./TopPlayingScreen";
import TopEndScreen from "./TopEndScreen";

export function Playing(props) {
  return <TopPlayingScreen {...props} />;
}
export function End(props) {
  return <TopEndScreen {...props} />;
}
