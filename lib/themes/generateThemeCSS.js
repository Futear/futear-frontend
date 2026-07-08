function camelToKebab(str) {
  return str.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
}

export function generateThemeCSS(scopeSlug, theme) {
  if (!theme) return "";

  const lightVars = Object.entries(theme.light || {})
    .map(([key, value]) => {
      return `--${camelToKebab(key)}:${value};`;
    })
    .join("");

  const darkVars = Object.entries(theme.dark || {})
    .map(([key, value]) => {
      return `--${camelToKebab(key)}:${value};`;
    })
    .join("");

  return `
    [data-scope="${scopeSlug}"] {
      ${lightVars}
    }

    .dark [data-scope="${scopeSlug}"] {
      ${darkVars}
    }
  `;
}
