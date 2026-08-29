import { PendingPage } from "@/components/common/pending-page";
export default function ApprovalInboxPage() { return <PendingPage title="Approval inbox" description="One queue for expenses, purchases, payments, transfers, progress, measurements, and documents." capabilities={["Pending approval categories", "Approve, reject, view details", "Approval audit trail"]} />; }
