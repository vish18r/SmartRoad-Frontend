"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/branding/brand-logo";
import { companyProfileApi } from "@/lib/api/company-profile-api";
import type { CompanyProfile } from "@/types/company";
import type { ApiError } from "@/types/api";

const NAV_LINKS: Array<[string, string]> = [
  ["Home", "#top"],
  ["About", "#about"],
  ["Services", "#services"],
  ["Founder", "#founder"],
  ["Contact", "#contact"],
];

const FEATURE_CARDS = [
  { title: "Quality Construction", detail: "Careful, code-conscious execution on every site we work." },
  { title: "Reliable Execution", detail: "Projects planned and delivered on the timelines we commit to." },
  { title: "Professional Finishing", detail: "Clean, durable finishing across roads, flooring, and structures." },
  { title: "Infrastructure Solutions", detail: "End-to-end civil construction, from groundwork to final touches." },
];

/** Small rotating set of generic construction-themed marks used to decorate service cards. Chosen by position, never by service name, so the frontend makes no assumptions about which services exist. */
function ServiceIcon({ index }: { index: number }) {
  const icons = [
    <path key="trowel" d="M4 20 16 8m0 0 2.5-2.5a2 2 0 0 1 2.8 2.8L19 11m-3-3 3 3M4 20l2-6 4 4-6 2Z" />,
    <path key="roller" d="M3 8h12v6H3zm12 2h6v6h-6zM6 14v4M18 14v4" />,
    <path key="gear" d="M12 8v2m0 4v2m4-6-1.5 1.5M9.5 12.5 8 14m8 0-1.5-1.5M9.5 11.5 8 10M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />,
    <path key="road" d="M7 20 10 4h4l3 16M11 9h2M10.5 14h3" />,
  ];
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
      {icons[index % icons.length]}
    </svg>
  );
}

function HeroIllustration() {
  return (
    <svg viewBox="0 0 320 240" className="w-full max-w-md text-slate-900" aria-hidden="true">
      <rect x="0" y="0" width="320" height="240" fill="none" />
      <path d="M0 190 Q80 160 160 175 T320 150" stroke="#0f172a" strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d="M0 190 Q80 160 160 175 T320 150" stroke="#dc2626" strokeWidth="2" strokeDasharray="10 10" fill="none" strokeLinecap="round" opacity="0.7" />
      <rect x="40" y="90" width="28" height="90" fill="#0f172a" opacity="0.9" />
      <rect x="76" y="60" width="34" height="120" fill="#1e293b" opacity="0.9" />
      <polygon points="93,30 76,60 110,60" fill="#1e293b" opacity="0.9" />
      <rect x="118" y="105" width="26" height="75" fill="#334155" opacity="0.85" />
      <rect x="230" y="120" width="30" height="60" fill="#1e293b" opacity="0.85" />
      <rect x="264" y="95" width="26" height="85" fill="#0f172a" opacity="0.9" />
    </svg>
  );
}

function LoadingLanding() {
  return (
    <main className="grid min-h-screen place-items-center bg-white px-4 text-center">
      <div>
        <BrandLogo />
        <p className="mt-6 text-sm text-slate-500">Loading company information…</p>
      </div>
    </main>
  );
}

function ErrorLanding({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-white px-4 text-center">
      <div className="max-w-sm">
        <BrandLogo />
        <p className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">{message}</p>
        <button onClick={onRetry} className="mt-4 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">
          Try again
        </button>
        <p className="mt-6 text-sm text-slate-500">
          Already have an account? <Link href="/login" className="font-semibold text-blue-700">Sign in</Link>
        </p>
      </div>
    </main>
  );
}

/**
 * Public, unauthenticated landing page. Fetches the company profile (brand
 * details, founder, additional contacts, services) from the backend and
 * renders it — no company data is hardcoded here beyond generic marketing
 * copy (feature-card blurbs) that isn't part of the company profile itself.
 */
export function PublicLandingPage() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    setError("");
    void companyProfileApi
      .getPublicProfile()
      .then((data) => setProfile(data))
      .catch((reason: ApiError) => setError(reason.message || "Unable to load company information."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingLanding />;
  if (error || !profile) return <ErrorLanding message={error || "Company information is unavailable."} onRetry={load} />;

  const { brandName, businessName, businessType, productName, tagline, phone, address, founder, additionalContacts, services } = profile;
  const telHref = `tel:${phone.replace(/\s+/g, "")}`;

  return (
    <main id="top" className="min-h-screen bg-white text-slate-900">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <BrandLogo />
          <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
            {NAV_LINKS.map(([label, href]) => (
              <a key={href} href={href} className="transition hover:text-blue-700">{label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-700">
              Login
            </Link>
            <Link href="/register" className="rounded-lg bg-blue-900 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Announcement bar */}
      <div className="bg-blue-900 px-4 py-2.5 text-center text-xs font-semibold text-white sm:text-sm">
        Building Stronger Roads. Building Better Futures.{" "}
        <a href="#services" className="ml-1 underline decoration-white/50 underline-offset-2 hover:decoration-white">
          Explore Services &rarr;
        </a>
      </div>

      {/* Hero */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-600">{productName}</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">{brandName}</h1>
          <p className="mt-2 text-lg font-semibold text-slate-600">{businessType}</p>
          <p className="mt-4 text-sm font-bold uppercase tracking-[0.15em] text-blue-900">{tagline}</p>
          <p className="mt-6 max-w-lg text-base leading-7 text-slate-600">
            Reliable civil construction and infrastructure solutions for roads, flooring, finishing and specialized construction work.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#services" className="rounded-lg bg-blue-900 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-800">
              Explore Our Services
            </a>
            <a href="#contact" className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:border-blue-400 hover:text-blue-700">
              Contact Us
            </a>
          </div>
        </div>
        <div className="flex justify-center lg:justify-end">
          <HeroIllustration />
        </div>
      </section>

      {/* Smart Road feature section */}
      <section className="border-t border-slate-100 bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-600">{productName}</p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{tagline}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-600">
            {productName} is how {brandName} organizes and delivers civil construction work — from site groundwork
            through final finishing — so every project stays on track.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURE_CARDS.map((card) => (
              <div key={card.title} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm">
                <h3 className="font-bold text-slate-900">{card.title}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-500">{card.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-900">What we do</p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Our Services</h2>
        </div>
        {services.length === 0 ? (
          <p className="mt-8 text-center text-sm text-slate-500">Service information is being updated.</p>
        ) : (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <div key={service.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-900 text-white">
                  <ServiceIcon index={index} />
                </div>
                <h3 className="mt-4 font-bold text-slate-900">{service.serviceName}</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">Delivered as part of {brandName}&rsquo;s civil construction work.</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* About */}
      <section id="about" className="border-t border-slate-100 bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-900">About</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">About {brandName}</h2>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="font-bold text-slate-900">{businessName}</p>
            <p className="mt-1 text-sm font-semibold text-slate-500">{businessType}</p>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              {brandName} provides civil construction, road, flooring, finishing, and related infrastructure services
              under the {productName} platform.
            </p>
          </div>
        </div>
      </section>

      {/* Founder / Leadership */}
      <section id="founder" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-900">Leadership</p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Our Leadership</h2>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {founder && (
            <div className="rounded-2xl border-2 border-blue-900 bg-blue-900 p-7 text-white shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-red-300">Main Founder</p>
              <p className="mt-2 text-2xl font-extrabold">{founder.contactName}</p>
            </div>
          )}
          {additionalContacts.map((contact) => (
            <div key={contact.id} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Additional Contact</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">{contact.contactName}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="border-t border-slate-100 bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-900">Get in touch</p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{brandName}</h2>
          <p className="mt-6 text-lg font-bold text-slate-900">{phone}</p>
          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{address}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href={telHref} className="rounded-lg bg-blue-900 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-800">
              Call Now
            </a>
            <a href={telHref} className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:border-blue-400 hover:text-blue-700">
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-3">
          <div>
            <BrandLogo showBusinessType showTagline />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">Quick Links</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {NAV_LINKS.map(([label, href]) => (
                <li key={href}><a href={href} className="text-slate-600 hover:text-blue-700">{label}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">Contact</h3>
            <p className="mt-3 text-sm font-semibold text-slate-700">{phone}</p>
            <p className="mt-1 whitespace-pre-line text-sm text-slate-500">{address}</p>
          </div>
        </div>
        <p className="mx-auto mt-10 max-w-7xl border-t border-slate-100 pt-6 text-xs text-slate-400">
          &copy; {new Date().getFullYear()} {businessName}. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
