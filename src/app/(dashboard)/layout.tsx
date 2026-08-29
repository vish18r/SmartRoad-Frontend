import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/navigation/sidebar";
import { AuthGate } from "@/components/auth/auth-gate";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { SyncStatus } from "@/components/common/sync-status";
import { CommandMenu } from "@/components/ui/command-menu";

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AuthGate><div className="flex min-h-screen"><Sidebar /><div className="min-w-0 flex-1"><Header /><div className="flex items-center justify-end border-b border-slate-200 bg-white px-5 py-2"><SyncStatus /></div><main className="p-5 md:p-8"><Breadcrumbs />{children}</main><CommandMenu /></div></div></AuthGate>;
}
