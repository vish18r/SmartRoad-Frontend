import { PendingPage } from "@/components/common/pending-page";
export default function ClientApprovalsPage() { return <PendingPage title="Client approvals" description="Prepare milestone, material, measurement, and final completion approvals for client review." capabilities={["Pending, approved, rejected, changes requested", "Approval details", "Client-scoped access"]} />; }
