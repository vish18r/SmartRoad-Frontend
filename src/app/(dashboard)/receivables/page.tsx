import { PendingPage } from "@/components/common/pending-page";
export default function ReceivablesPage() { return <PendingPage title="Receivables" description="Track client invoices, due dates, paid amounts, balances, and overdue days." capabilities={["Client and project filters", "Overdue alerts", "Invoice history"]} />; }
