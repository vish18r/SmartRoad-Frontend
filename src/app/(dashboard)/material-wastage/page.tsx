import { PendingPage } from "@/components/common/pending-page";
export default function MaterialWastagePage() { return <PendingPage title="Material wastage" description="Compare expected, used, and wasted quantity with configurable warning thresholds." capabilities={["Wastage percentage", "Project and material filters", "Threshold warnings"]} />; }
