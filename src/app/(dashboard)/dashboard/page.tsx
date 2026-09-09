"use client";

import { useEffect, useState } from "react";
import { ErrorState, Loading } from "@/components/common/states";
import { Card } from "@/components/ui/card";
import { healthApi, type HealthStatus } from "@/lib/api/health-api";
import type { ApiError } from "@/types/api";
import { ChartPlaceholder } from "@/components/ui/chart-placeholder";
import Link from "next/link";

export default function DashboardPage() {
	const [health, setHealth] = useState<HealthStatus | null>(null);
	const [error, setError] = useState("");

	useEffect(() => {
		let active = true;
		void healthApi.getStatus()
			.then((status) => { if (active) setHealth(status); })
			.catch((reason: ApiError) => { if (active) setError(reason.message); });
		return () => { active = false; };
	}, []);

	return <>
		<div><p className="text-sm font-medium text-orange-600">Overview</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Dashboard</h1><p className="mt-1 text-sm text-slate-500">Your construction operations workspace.</p></div>
		<section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			<Card title="Backend status" value={health?.status || (error ? "Unavailable" : "Checking...")} detail={health ? "Connected" : undefined} />
			<Card title="Projects" value="Not available" detail="Backend endpoint pending" />
			<Card title="Workers" value="Not available" detail="Backend endpoint pending" />
			<Card title="Expenses" value="Not available" detail="Backend endpoint pending" />
		</section>
		<section className="mt-7 rounded-xl border border-slate-200 bg-white p-6">
			<h2 className="font-semibold text-slate-900">Project activity</h2>
			{error ? <div className="mt-3"><ErrorState message={error} /></div> : health ? <p className="mt-2 text-sm text-slate-500">Operational project data will appear here when its backend endpoints are available.</p> : <div className="mt-3"><Loading /></div>}
		</section>
		<section className="mt-7 grid gap-4 sm:grid-cols-2"><ChartPlaceholder title="Project progress" description="Completion by project and road section." /><ChartPlaceholder title="Monthly expenses" description="Committed, spent, and remaining budget." /><ChartPlaceholder title="Material and fuel usage" description="Consumption trends across sites and machines." /><ChartPlaceholder title="Worker attendance" description="Present and absent workforce by day." /></section>
		<section className="mt-7 rounded-xl border border-slate-200 bg-white p-6"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-semibold text-slate-900">Quick access</h2><Link href="/report-builder" className="text-sm font-semibold text-orange-600">Build a report</Link></div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Link href="/site-diary" className="rounded-lg border border-slate-200 p-4 text-sm font-semibold hover:border-orange-300">Daily site diary</Link><Link href="/approvals" className="rounded-lg border border-slate-200 p-4 text-sm font-semibold hover:border-orange-300">Pending approvals</Link><Link href="/documents" className="rounded-lg border border-slate-200 p-4 text-sm font-semibold hover:border-orange-300">Project documents</Link><Link href="/completion" className="rounded-lg border border-slate-200 p-4 text-sm font-semibold hover:border-orange-300">Completion checklist</Link></div></section>
	</>;
}
