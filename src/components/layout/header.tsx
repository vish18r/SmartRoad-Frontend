"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import type { User } from "@/types/auth";
import { useTheme } from "@/components/ui/theme-provider";
import { useWorkspace } from "@/components/workspace/workspace-context";
import { organizationsApi } from "@/lib/api/organizations-api";
import { projectApi } from "@/lib/api/project-api";
import type { OrganizationResponse } from "@/types/organization";
import type { ProjectResponse } from "@/types/project";
import { ProfileDropdown } from "@/components/layout/profile-dropdown";
import { Bell } from "lucide-react";

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");
  const { theme, setTheme } = useTheme();
  const { organizationId, projectId, setOrganizationId, setProjectId } = useWorkspace();
  const [organizations, setOrganizations] = useState<OrganizationResponse[]>([]);
  const [projects, setProjects] = useState<ProjectResponse[]>([]);

  useEffect(() => {
    organizationsApi.getMyOrganizations().then(setOrganizations).catch(() => setOrganizations([]));
  }, []);

  useEffect(() => {
    if (!organizationId) {
      setProjects([]);
      return;
    }
    projectApi.list(organizationId).then(setProjects).catch(() => setProjects([]));
  }, [organizationId]);

  useEffect(() => {
    setUser(auth.getUser());
  }, []);

  const currentOrganization = organizations.find((organization) => organization.id === organizationId) ?? null;

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (search.trim()) router.push(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 shadow-[var(--shadow-sm)] md:px-5">
      <button
        type="button"
        aria-label="Toggle navigation"
        onClick={() => window.dispatchEvent(new Event("smartroad:toggle-sidebar"))}
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm transition-colors duration-[var(--transition-fast)] hover:bg-slate-50 md:hidden"
      >
        Menu
      </button>

      <div className="order-2 flex w-full gap-2 md:order-none md:w-auto">
        <select
          aria-label="Organization"
          value={organizationId ?? ""}
          onChange={(event) => setOrganizationId(event.target.value || null)}
          className="max-w-[10rem] rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs text-slate-800 transition-colors duration-[var(--transition-fast)] [&>option]:bg-white [&>option]:text-slate-800 hover:border-slate-300"
        >
          <option value="">{organizations.length ? "Select organization" : "No organizations"}</option>
          {organizations.map((organization) => (
            <option key={organization.id} value={organization.id}>
              {organization.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Current project"
          value={projectId ?? ""}
          onChange={(event) => setProjectId(event.target.value || null)}
          disabled={!organizationId}
          className="max-w-[10rem] rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs text-slate-800 transition-colors duration-[var(--transition-fast)] [&>option]:bg-white [&>option]:text-slate-800 hover:border-slate-300 disabled:opacity-50"
        >
          <option value="">
            {!organizationId ? "Select organization first" : projects.length ? "Select project" : "No projects"}
          </option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <form onSubmit={submitSearch} className="order-3 w-full md:order-none md:w-auto">
        <input
          aria-label="Search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search workspace..."
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition-[box-shadow,border-color] duration-[var(--transition-fast)] placeholder:text-slate-400 focus:border-transparent focus:shadow-[var(--focus-ring)] md:w-72"
        />
      </form>

      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/notifications")}
          aria-label="Open notifications"
          className="relative rounded-lg border border-slate-200 px-3 py-2 text-sm transition-colors duration-[var(--transition-fast)] hover:bg-slate-50"
        >
          <Bell className="h-5 w-5 text-slate-500" strokeWidth={2} />
        </button>
        <select
          aria-label="Theme"
          value={theme}
          onChange={(event) => setTheme(event.target.value as "light" | "dark" | "system")}
          className="rounded-lg border border-slate-200 bg-transparent px-2 py-2 text-xs transition-colors duration-[var(--transition-fast)] hover:border-slate-300"
        >
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
        <ProfileDropdown user={user} organization={currentOrganization} />
      </div>
    </header>
  );
}
