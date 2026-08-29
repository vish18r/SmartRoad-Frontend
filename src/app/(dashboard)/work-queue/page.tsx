import { PendingPage } from "@/components/common/pending-page";
export default function WorkQueuePage() { return <PendingPage title="My work queue" description="Prioritize work assigned to the current user across pending, due today, overdue, and completed states." capabilities={["Priority sorting", "Due today and overdue", "Personal assignment scope"]} />; }
