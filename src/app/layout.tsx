import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { WorkspaceProvider } from "@/components/workspace/workspace-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartRoad | Contractor Management",
  description: "Road construction and contractor management system.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><body><ThemeProvider><WorkspaceProvider>{children}</WorkspaceProvider></ThemeProvider></body></html>;
}
