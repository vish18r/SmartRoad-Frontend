import { PendingPage } from "@/components/common/pending-page";
export default function PaymentsPage() { return <PendingPage title="Payments" description="Track worker, supplier, machine, and other payment obligations." capabilities={["Paid, pending, partial, and overdue statuses", "Due dates and payment history", "Filter by payment type and status"]} />; }
