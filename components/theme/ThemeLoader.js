// components/theme/ThemeLoader.jsx

import fs from "fs";
import path from "path";

const themeCache = new Map();

function getThemeCSS(slug) {
  if (themeCache.has(slug)) {
    return themeCache.get(slug);
  }

  const file = path.join(process.cwd(), "public", "themes", `${slug}.css`);

  if (!fs.existsSync(file)) {
    themeCache.set(slug, null);
    return null;
  }

  const css = fs.readFileSync(file, "utf8");

  themeCache.set(slug, css);

  return css;
}

export default function ThemeLoader({ slug }) {
  const css = getThemeCSS(slug);

  if (!css) return null;

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: css,
      }}
    />
  );
}
