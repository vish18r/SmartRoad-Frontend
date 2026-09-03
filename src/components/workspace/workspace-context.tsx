"use client";

import React, { createContext, useContext } from "react";

type WorkspaceContextType = {};

const WorkspaceContext = createContext<WorkspaceContextType>({});

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceContext.Provider value={{}}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  return useContext(WorkspaceContext);
}