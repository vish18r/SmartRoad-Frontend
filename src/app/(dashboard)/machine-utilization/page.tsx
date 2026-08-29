import { PendingPage } from "@/components/common/pending-page";
export default function MachineUtilizationPage() { return <PendingPage title="Machine utilization" description="Compare running hours, idle time, fuel, maintenance cost, and cost per hour." capabilities={["Utilization percentage", "Project-wise usage", "Running and idle hour analytics"]} />; }
