import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { WorkspaceProvider } from "@/components/workspace/workspace-context";
import { ToastProvider } from "@/components/common/toast-provider";
import { APP_TITLE, APP_DESCRIPTION } from "@/constants/branding";
import "./globals.css";

export const metadata: Metadata = {
  title: APP_TITLE,
  description: APP_DESCRIPTION,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // ToastProvider is mounted here rather than in the dashboard layout so that
  // useToast() works on every route — it throws when no provider is above it.
  return <html lang="en" suppressHydrationWarning><body><ThemeProvider><WorkspaceProvider><ToastProvider>{children}</ToastProvider></WorkspaceProvider></ThemeProvider></body></html>;
}
