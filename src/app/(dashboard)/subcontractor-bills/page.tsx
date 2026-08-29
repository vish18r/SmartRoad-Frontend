import { PendingPage } from "@/components/common/pending-page";
export default function SubcontractorBillsPage() { return <PendingPage title="Subcontractor billing" description="Track bill quantities, rates, gross amounts, deductions, paid amounts, and balances." capabilities={["Bill history", "Deductions", "Payment balance"]} />; }
