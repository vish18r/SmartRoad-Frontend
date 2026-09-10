"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

// Which organization and project the user is currently working in. Most API calls
// are organization-scoped, so this selection is held once here rather than being
// threaded through every page.
type WorkspaceContextType = {
  organizationId: string | null;
  projectId: string | null;
  setOrganizationId: (organizationId: string | null) => void;
  setProjectId: (projectId: string | null) => void;
};

const ORGANIZATION_KEY = "workspace:organizationId";
const PROJECT_KEY = "workspace:projectId";

const WorkspaceContext = createContext<WorkspaceContextType>({
  organizationId: null,
  projectId: null,
  setOrganizationId: () => {},
  setProjectId: () => {},
});

// Reads a persisted selection. Wrapped because storage access throws in private
// windows and in browsers configured to block site data.
function readStored(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStored(key: string, value: string | null) {
  try {
    if (value === null) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // A failed write only costs the user their selection on the next reload.
  }
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [organizationId, setOrganizationIdState] = useState<string | null>(null);
  const [projectId, setProjectIdState] = useState<string | null>(null);

  // Hydrate after mount: localStorage is unavailable during server rendering, and
  // reading it in the initial state would desync the first client render.
  useEffect(() => {
    setOrganizationIdState(readStored(ORGANIZATION_KEY));
    setProjectIdState(readStored(PROJECT_KEY));
  }, []);

  const setOrganizationId = useCallback((next: string | null) => {
    setOrganizationIdState(next);
    writeStored(ORGANIZATION_KEY, next);
    // A project belongs to one organization, so switching organization clears it.
    setProjectIdState(null);
    writeStored(PROJECT_KEY, null);
  }, []);

  const setProjectId = useCallback((next: string | null) => {
    setProjectIdState(next);
    writeStored(PROJECT_KEY, next);
  }, []);

  const value = useMemo<WorkspaceContextType>(
    () => ({ organizationId, projectId, setOrganizationId, setProjectId }),
    [organizationId, projectId, setOrganizationId, setProjectId]
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  return useContext(WorkspaceContext);
}
