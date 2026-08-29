import { ModulePage } from "./module-page";

export function PendingPage({ title, description, capabilities }: { title: string; description: string; capabilities?: string[] }) {
  return <ModulePage title={title} description={description} capabilities={capabilities} />;
}
