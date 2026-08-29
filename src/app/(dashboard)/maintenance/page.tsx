import { PendingPage } from "@/components/common/pending-page";
export default function MaintenancePage() { return <PendingPage title="Machine maintenance" description="Plan service intervals and keep equipment working safely." capabilities={["Maintenance history and cost", "Running hours and next service", "Due and overdue alerts"]} />; }
