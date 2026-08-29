import { PendingPage } from "@/components/common/pending-page";
export default function SupervisorApprovalsPage() { return <PendingPage title="Supervisor approvals" description="Prepare approval queues for daily progress, materials, attendance, machines, and site reports." capabilities={["Progress and usage approvals", "Approver and date", "Audit trail"]} />; }
