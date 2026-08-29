import { PendingPage } from "@/components/common/pending-page";
export default function FuelLogPage() { return <PendingPage title="Fuel log" description="Record machine and vehicle fuel usage, readings, suppliers, and invoices." capabilities={["Fuel type and quantity", "Meter or hour reading", "Supplier and invoice details"]} />; }
