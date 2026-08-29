"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface WorkspaceContextValue {
  organizationId: string;
  projectId: string;
  setOrganizationId: (id: string) => void;
  setProjectId: (id: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [organizationId, setOrganizationId] = useState("");
  const [projectId, setProjectId] = useState("");
  useEffect(() => {
    setOrganizationId(window.localStorage.getItem("smartroad_organization") || "");
    setProjectId(window.sessionStorage.getItem("smartroad_project") || "");
  }, []);
  const chooseOrganization = (id: string) => { setOrganizationId(id); window.localStorage.setItem("smartroad_organization", id); };
  const chooseProject = (id: string) => { setProjectId(id); window.sessionStorage.setItem("smartroad_project", id); };
  return <WorkspaceContext.Provider value={{ organizationId, projectId, setOrganizationId: chooseOrganization, setProjectId: chooseProject }}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return value;
}
