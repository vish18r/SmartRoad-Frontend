import { PendingPage } from "@/components/common/pending-page";
export default function RemindersPage() { return <PendingPage title="Reminders" description="Prepare reminders for contracts, deadlines, maintenance, payments, and expiring documents." capabilities={["Date and time", "Repeat and priority", "Reminder categories"]} />; }
