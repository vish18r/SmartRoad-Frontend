"use client";

import Link from "next/link";
import { BRAND_NAME, BRAND_BUSINESS_TYPE, BRAND_TAGLINE, PRODUCT_NAME } from "@/constants/branding";

interface BrandLogoProps {
  href?: string;
  /** Renders a smaller mark + wordmark, for tight spaces like the sidebar rail. */
  compact?: boolean;
  /** Set when the logo sits on a dark surface (e.g. the sidebar) so it stays legible. */
  darkSurface?: boolean;
  /** Shows the "Developers & Civil Contractor" subtitle beneath the wordmark. */
  showBusinessType?: boolean;
  /** Shows the "BUILD ROADS • BUILD LIFE" tagline beneath the wordmark/subtitle. */
  showTagline?: boolean;
  /** Shows the "SMART ROAD" product label beneath the wordmark (ignored if showTagline is set). */
  showProduct?: boolean;
  /** Shows a small "SMART ROAD" product badge next to the wordmark, for full headline placements. */
  showProductBadge?: boolean;
  className?: string;
}

/**
 * Renders the BHAGYAVANTI INFRA brand mark and wordmark — a stylized skyline
 * rising over a road, evoking the "Developers & Civil Contractor" identity.
 * This is the single, reusable brand logo used across the app (auth pages,
 * sidebar, headers, footer, loading screens) so branding stays centralized.
 */
export function BrandLogo({
  href = "/",
  compact = false,
  darkSurface = false,
  showBusinessType = false,
  showTagline = false,
  showProduct = false,
  showProductBadge = false,
  className = "",
}: BrandLogoProps) {
  const markBg = darkSurface ? "bg-white" : "bg-slate-900";
  const markFg = darkSurface ? "text-slate-900" : "text-white";
  const dashColor = darkSurface ? "#0f172a" : "#ffffff";
  const wordColor = darkSurface ? "text-white" : "text-slate-900";
  const subColor = darkSurface ? "text-slate-400" : "text-slate-500";

  return (
    <Link
      href={href}
      aria-label={`${BRAND_NAME} home`}
      className={`inline-flex items-center gap-3 ${className}`}
    >
      <span
        className={`grid shrink-0 place-items-center rounded-lg ${markBg} ${compact ? "h-9 w-9" : "h-12 w-12"}`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 40 28" className={`${markFg} ${compact ? "h-5 w-5" : "h-7 w-7"}`}>
          <rect x="2" y="12" width="6" height="12" fill="currentColor" />
          <polygon points="9,7 12.5,2 16,7" fill="currentColor" />
          <rect x="9" y="7" width="7" height="17" fill="currentColor" />
          <rect x="17" y="14" width="6" height="10" fill="currentColor" />
          <path d="M1 25 Q14 20 24 17 T39 12" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="24" cy="17" r="1" fill={dashColor} />
          <circle cx="30.5" cy="14.3" r="1" fill={dashColor} />
          <circle cx="36.5" cy="12.2" r="1" fill={dashColor} />
        </svg>
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="flex items-baseline gap-2">
          <span className={`truncate font-extrabold tracking-tight ${wordColor} ${compact ? "text-sm" : "text-lg sm:text-xl"}`}>
            {BRAND_NAME}
          </span>
          {showProductBadge && (
            <span className="hidden shrink-0 items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-600 sm:inline-flex">
              <svg viewBox="0 0 16 12" className="h-3 w-3" aria-hidden="true">
                <path d="M2 12 6 0h2L4 12H2Z" fill="currentColor" />
                <path d="M7 12 11 0h2L9 12H7Z" fill="currentColor" />
              </svg>
              {PRODUCT_NAME}
            </span>
          )}
        </span>
        {showBusinessType && (
          <span className={`truncate text-[10px] font-semibold uppercase tracking-[0.12em] ${subColor}`}>
            {BRAND_BUSINESS_TYPE}
          </span>
        )}
        {showTagline && (
          <span className={`mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${subColor}`}>
            {BRAND_TAGLINE}
          </span>
        )}
        {showProduct && !showTagline && (
          <span className={`mt-0.5 text-[10px] font-medium uppercase tracking-wider ${subColor}`}>
            {PRODUCT_NAME}
          </span>
        )}
      </span>
    </Link>
  );
}
