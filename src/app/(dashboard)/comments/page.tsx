import { PendingPage } from "@/components/common/pending-page";
export default function CommentsPage() { return <PendingPage title="Project communication" description="Prepare discussions, replies, mentions, and attachments for projects, progress, issues, expenses, and materials." capabilities={["Comments and replies", "@mentions", "Image and document attachments"]} />; }
