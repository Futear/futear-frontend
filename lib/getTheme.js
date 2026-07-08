import { globalTheme } from "@/config/themes/global";
import { futmundialTheme } from "@/config/themes/futmundial";

const THEMES = {
  global: globalTheme,
  futmundial: futmundialTheme,
};

export function getTheme(scope = "global") {
  return THEMES[scope] || THEMES.global;
}
