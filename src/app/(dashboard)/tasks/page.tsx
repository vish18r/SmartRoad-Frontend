import { PendingPage } from "@/components/common/pending-page";
export default function TasksPage() { return <PendingPage title="Tasks" description="Plan project work with assigned users, dates, priorities, statuses, and completion percentage." capabilities={["Kanban: To do, In progress, Completed", "Assignee and due date", "Progress tracking"]} />; }
