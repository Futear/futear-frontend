"use client";

import ShirtPlayingScreen from "./ShirtPlayingScreen";
import ShirtEndScreen from "./ShirtEndScreen";

export function Playing(props) {
  return <ShirtPlayingScreen {...props} />;
}

export function End({ result, state, homeUrl }) {
  return <ShirtEndScreen result={result} state={state} homeUrl={homeUrl} />;
}
