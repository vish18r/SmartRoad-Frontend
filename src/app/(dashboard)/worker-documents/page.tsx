import { PendingPage } from "@/components/common/pending-page";
export default function WorkerDocumentsPage() { return <PendingPage title="Worker documents" description="Prepare ID proof, licenses, certifications, and other worker document expiry tracking." capabilities={["Expired, expiring soon, valid", "Worker document categories", "Expiry reminders"]} />; }
