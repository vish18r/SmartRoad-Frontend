import Link from "next/link";
import { PendingPage } from "@/components/common/pending-page";
export default function SettingsPage() { return <div><PendingPage title="Settings" description="Manage account security, notifications, theme, language, and workspace preferences." capabilities={["Profile and account", "Notifications and preferences", "Language: English, Hindi, Kannada"]} /><Link href="/settings/security" className="mt-6 inline-block rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">Security settings</Link></div>; }
