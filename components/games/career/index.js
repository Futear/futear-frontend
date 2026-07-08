"use client";

import CareerPlayingScreen from "./CareerPlayingScreen";
import CareerEndScreen from "./CareerEndScreen";

export function Playing(props) {
  return <CareerPlayingScreen {...props} />;
}

export function End({ result, state, homeUrl }) {
  return <CareerEndScreen result={result} state={state} homeUrl={homeUrl} />;
}
