import { PendingPage } from "@/components/common/pending-page";
export default function StockLedgerPage() { return <PendingPage title="Material stock ledger" description="Reconcile opening stock, purchases, transfers, usage, and closing stock." capabilities={["Project, material, and date filters", "Stock movement history", "Closing stock reconciliation"]} />; }
