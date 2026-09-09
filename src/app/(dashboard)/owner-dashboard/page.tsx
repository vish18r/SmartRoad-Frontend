"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ErrorState, Loading } from "@/components/common/states";
import { Card } from "@/components/ui/card";
import { useApi } from "@/hooks/useApi";
import { dashboardApi } from "@/lib/api/dashboard-api";

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

export default function OwnerDashboardPage() {
	const searchParams = useSearchParams();
	const requested = searchParams.get("organizationId") || "";
	const organizationId = isUuid(requested) ? requested : "";

	const { data, loading, error } = useApi(
		() => dashboardApi.getOwnerDashboard(organizationId),
		{ skip: !organizationId },
	);

	if (!organizationId) {
		return <>
			<PageHeading />
			<div className="mt-7 rounded-xl border border-slate-200 bg-white p-6 text-center">
				<p className="text-sm text-slate-600">Select an organization to see its executive figures.</p>
				<Link href="/organizations" className="mt-4 inline-flex rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700">Go to organizations</Link>
			</div>
		</>;
	}

	if (loading) return <><PageHeading /><div className="mt-7"><Loading /></div></>;
	if (error) return <><PageHeading /><div className="mt-7"><ErrorState message={error.message} /></div></>;
	if (!data) return <><PageHeading /><div className="mt-7"><ErrorState message="No owner dashboard data was returned." /></div></>;

	const { portfolio, contracts, financials, deadlines } = data;
	const variance = financials.budgetVariance;

	return <>
		<PageHeading />

		<section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			<Card title="Contracted value" value={currency.format(contracts.totalContractValue)} detail={`${contracts.activeContracts} of ${contracts.totalContracts} contracts active`} />
			<Card title="Approved budget" value={currency.format(financials.totalBudget)} detail={`${portfolio.activeProjects} active projects`} />
			<Card title="Cost incurred" value={currency.format(financials.totalActualCost)} detail={financials.overBudgetProjects > 0 ? `${financials.overBudgetProjects} over budget` : undefined} />
			<Card title={variance < 0 ? "Budget overrun" : "Budget remaining"} value={currency.format(Math.abs(variance))} detail={variance < 0 ? "Spent beyond approved budget" : undefined} />
		</section>

		<section className="mt-7 grid gap-4 lg:grid-cols-3">
			<Panel title="Owner and site views">
				<Row label="Total projects" value={portfolio.totalProjects} />
				<Row label="Active" value={portfolio.activeProjects} />
				<Row label="On hold" value={portfolio.onHoldProjects} />
				<Row label="Completed" value={portfolio.completedProjects} />
				<Row label="Average progress" value={`${portfolio.averageProgress.toFixed(1)}%`} />
			</Panel>

			<Panel title="Business and project health">
				<Row label="Active contract value" value={currency.format(contracts.activeContractValue)} />
				<Row label="Projects over budget" value={financials.overBudgetProjects} />
				<Row label="Projects overdue" value={deadlines.overdueProjects} />
				<Row label="Due in 30 days" value={deadlines.projectsDueIn30Days} />
				<Row label="Contracts expiring in 30 days" value={deadlines.contractsExpiringIn30Days} />
			</Panel>

			<Panel title="Revenue, cost, and procurement">
				<Row label="Contracted revenue" value={currency.format(contracts.totalContractValue)} />
				<Row label="Cost incurred" value={currency.format(financials.totalActualCost)} />
				<Row label="Committed procurement" value={currency.format(financials.committedProcurement)} />
				<Row label="Awaiting delivery" value={currency.format(financials.procurementAwaitingDelivery)} />
				<Row label="Deliveries overdue" value={deadlines.deliveriesOverdue} />
			</Panel>
		</section>

		<p className="mt-5 text-xs text-slate-500">
			Figures are aggregated from recorded projects, contracts, and purchase orders. Invoiced revenue and
			outstanding payments are not shown because the platform does not yet record invoices or payments.
		</p>
	</>;
}

function PageHeading() {
	return <div>
		<p className="text-sm font-medium text-orange-600">SMART ROAD</p>
		<h1 className="mt-1 text-2xl font-bold text-slate-900">Owner dashboard</h1>
		<p className="mt-1 text-sm text-slate-500">Executive visibility into business value, contracts, revenue, expenses, deadlines, and project health.</p>
	</div>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
	return <section className="rounded-xl border border-slate-200 bg-white p-6">
		<h2 className="font-semibold text-slate-900">{title}</h2>
		<dl className="mt-4 space-y-3">{children}</dl>
	</section>;
}

function Row({ label, value }: { label: string; value: string | number }) {
	return <div className="flex items-baseline justify-between gap-3 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
		<dt className="text-sm text-slate-500">{label}</dt>
		<dd className="text-sm font-semibold text-slate-900">{value}</dd>
	</div>;
}
