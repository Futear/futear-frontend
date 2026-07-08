"use client";

import { createContext, useContext } from "react";

const ScopeContext = createContext(null);

export function ScopeProvider({ value, children }) {
  return (
    <ScopeContext.Provider value={value}>{children}</ScopeContext.Provider>
  );
}

export function useScope() {
  return useContext(ScopeContext);
}
