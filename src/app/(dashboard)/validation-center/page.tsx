import { PendingPage } from "@/components/common/pending-page";
export default function ValidationCenterPage() { return <PendingPage title="Validation center" description="Surface missing locations, duplicate phones, missing GST, invalid dates, negative quantities, and missing documents." capabilities={["Problem categories", "Affected record links", "Admin review queue"]} />; }
