export function gameUsesContent(gameDefinition, context) {
  const content = gameDefinition?.content;

  /* =============================
     DISABLED
  ============================= */

  if (!content?.enabled) {
    return false;
  }

  /* =============================
     ALL SCOPES
  ============================= */

  if (!Array.isArray(content.scopes)) {
    return true;
  }

  if (content.scopes.length === 0) {
    return true;
  }

  /* =============================
     SPECIFIC SCOPES
  ============================= */

  return content.scopes.includes(context);
}
