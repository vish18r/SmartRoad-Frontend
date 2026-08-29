import { PendingPage } from "@/components/common/pending-page";
export default function RunningBillsPage() { return <PendingPage title="Running account bills" description="Track RA bill numbers, work value, previous and current bills, deductions, net, paid, and balance." capabilities={["Payment progress", "Bill history", "Deductions and balance"]} />; }
