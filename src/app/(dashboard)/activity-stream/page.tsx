import { PendingPage } from "@/components/common/pending-page";
export default function ActivityStreamPage() { return <PendingPage title="Global activity stream" description="A real-time-style grouped feed for project, payment, material, maintenance, and progress activity." capabilities={["Today, yesterday, earlier", "Activity categories", "Live updates when backend streaming exists"]} />; }
