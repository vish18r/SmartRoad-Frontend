import { PendingPage } from "@/components/common/pending-page";
export default function ClientPortalPage() { return <PendingPage title="Client portal" description="Prepare a restricted client view of their projects, progress, documents, bills, issues, and completion status." capabilities={["Client-only project scope", "Milestones and approvals", "Bills and payment status"]} />; }
