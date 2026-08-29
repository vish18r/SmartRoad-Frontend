import { PendingPage } from "@/components/common/pending-page";
export default function CashFlowPage() { return <PendingPage title="Cash flow" description="Track money received, money paid, pending receivables, pending payables, and net cash flow." capabilities={["Monthly cash-flow chart", "Receivables and payables", "Net cash flow"]} />; }
