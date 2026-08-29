import { PendingPage } from "@/components/common/pending-page";
export default function QrCheckinPage() { return <PendingPage title="QR site check-in" description="Prepare scan-to-site attendance while refusing to fake QR verification or attendance writes." capabilities={["Camera scan surface", "Project identification", "Check-in confirmation"]} />; }
