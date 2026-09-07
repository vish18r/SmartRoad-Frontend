import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { WorkspaceProvider } from "@/components/workspace/workspace-context";
import { APP_TITLE, APP_DESCRIPTION } from "@/constants/branding";
import "./globals.css";

export const metadata: Metadata = {
  title: APP_TITLE,
  description: APP_DESCRIPTION,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><body><ThemeProvider><WorkspaceProvider>{children}</WorkspaceProvider></ThemeProvider></body></html>;
}
