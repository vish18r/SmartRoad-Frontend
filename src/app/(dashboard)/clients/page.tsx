import { PendingPage } from "@/components/common/pending-page";
export default function ClientsPage() { return <PendingPage title="Clients" description="Manage client contacts, departments, GST details, projects, contracts, and payment history." capabilities={["Client directory", "Project and contract history", "Receivables and payments"]} />; }
