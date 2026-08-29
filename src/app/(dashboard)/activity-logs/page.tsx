import { PendingPage } from "@/components/common/pending-page";
export default function ActivityLogsPage() { return <PendingPage title="Activity logs" description="A searchable audit trail for actions across the workspace." capabilities={["Search and module filters", "User and date-range filters", "Pagination and export"]} />; }
