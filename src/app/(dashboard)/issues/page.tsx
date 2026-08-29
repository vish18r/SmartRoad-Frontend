import { PendingPage } from "@/components/common/pending-page";
export default function IssuesPage() { return <PendingPage title="Project issues" description="Report, assign, prioritize, and resolve project problems with an auditable history." capabilities={["Priority and category filters", "Assignment and due dates", "Open, progress, resolved, and closed statuses"]} />; }
