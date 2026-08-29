import { PendingPage } from "@/components/common/pending-page";
export default function ApprovalsPage() { return <PendingPage title="Approvals" description="Review expenses, purchases, transfers, payments, and contracts through a clear approval queue." capabilities={["Pending, approved, and rejected", "Approver and approval date", "Action history"]} />; }
