"use client";

import { createContext, useContext, useState } from "react";

const ScopeModalContext = createContext(null);

export function ScopeModalProvider({ children, scopes }) {
  const [isOpen, setIsOpen] = useState(false);

  const openScopeModal = () => setIsOpen(true);

  const closeScopeModal = () => setIsOpen(false);

  return (
    <ScopeModalContext.Provider
      value={{
        isOpen,
        scopes,
        openScopeModal,
        closeScopeModal,
      }}
    >
      {children}
    </ScopeModalContext.Provider>
  );
}

export function useScopeModal() {
  const context = useContext(ScopeModalContext);

  if (!context) {
    throw new Error("useScopeModal must be used within ScopeModalProvider");
  }

  return context;
}
