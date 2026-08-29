import Link from "next/link";

export function ProjectContractNotice() {
  return <section className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-950"><p className="text-sm font-bold">Project API required</p><p className="mt-2 text-sm leading-6">The current Spring Boot backend has no project or CC Road controller, request DTO, response DTO, or persistence contract. Project records and mutations are disabled until that contract is added.</p><Link href="/dashboard" className="mt-4 inline-block text-sm font-bold text-orange-700">Return to dashboard</Link></section>;
}
