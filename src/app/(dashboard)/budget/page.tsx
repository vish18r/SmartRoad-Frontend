import { PendingPage } from "@/components/common/pending-page";
export default function BudgetPage() { return <PendingPage title="Budget control" description="Monitor budget, committed cost, spent cost, remaining amount, and project health." capabilities={["Project-wise breakdown", "Within limit, near limit, and over budget", "Committed versus spent"]} />; }
