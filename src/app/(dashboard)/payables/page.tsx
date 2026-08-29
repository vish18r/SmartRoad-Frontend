import { PendingPage } from "@/components/common/pending-page";
export default function PayablesPage() { return <PendingPage title="Payables" description="Track amounts owed to suppliers, workers, machine owners, and transport vendors." capabilities={["Total, paid, outstanding, overdue", "Vendor type filters", "Payment history"]} />; }
