"use client";
export default function SitesPage() {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-orange-600">Smart Road</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Sites</h1>
        <p className="mt-1 text-sm text-slate-500">Sites correspond to your active projects. Manage them from the Projects module.</p>
      </div>
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-8 text-center">
        <p className="font-semibold text-slate-900">Sites are managed as Projects</p>
        <p className="mt-2 text-sm text-slate-500">Each project is a site. Go to Projects to view and manage your sites.</p>
        <a href="/projects" className="mt-4 inline-block rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700">Go to Projects</a>
      </div>
    </>
  );
}
