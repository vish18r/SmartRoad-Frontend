import { PendingPage } from "@/components/common/pending-page";
export default function MaterialTransfersPage() { return <PendingPage title="Material transfers" description="Move material between project sites with approval and receipt tracking." capabilities={["Source and destination projects", "Quantity and transfer date", "Approval and receipt details"]} />; }
