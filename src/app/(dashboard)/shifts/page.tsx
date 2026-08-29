import { PendingPage } from "@/components/common/pending-page";
export default function ShiftsPage() { return <PendingPage title="Shift management" description="Assign morning, afternoon, and night shifts to workers and supervisors by project." capabilities={["Shift start and end", "Worker attendance", "Supervisor assignments"]} />; }
