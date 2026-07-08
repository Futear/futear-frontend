// lib/getPublicScopesLight.js

import { cache } from "react";
import { getAllScopes } from "./getScopes";

export const getPublicScopesLight = cache(() => {
  return getAllScopes().map((scope) => ({
    slug: scope.slug,
    name: scope.name,
    context: scope.context,

    branding: {
      shield: scope.branding?.shield || "",
      logo: scope.branding?.logo || "",
    },
  }));
});
