import { PendingPage } from "@/components/common/pending-page";
export default function ReportBuilderPage() { return <PendingPage title="Report builder" description="Choose report type, project, date range, and status before viewing, printing, or exporting." capabilities={["Project, expense, attendance, payroll", "Material, fuel, machine, daily progress", "Profit/loss and payment reports"]} />; }
