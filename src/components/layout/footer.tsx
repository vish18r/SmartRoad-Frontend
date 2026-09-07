import { BrandLogo } from "@/components/branding/brand-logo";
import { BRAND_LEGAL_NAME, BRAND_TAGLINE, PRODUCT_NAME } from "@/constants/branding";

/**
 * Application footer shown across the authenticated workspace.
 * Carries the brand mark, tagline, and legal business name so branding
 * stays consistent without duplicating company text in every page.
 */
export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-slate-200 bg-white px-5 py-6 md:px-8">
      <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <BrandLogo compact showTagline />
        <div className="text-xs leading-5 text-slate-500">
          <p>
            &copy; {year} {BRAND_LEGAL_NAME}. All rights reserved.
          </p>
          <p className="text-slate-400">
            {PRODUCT_NAME} &mdash; {BRAND_TAGLINE}
          </p>
        </div>
      </div>
    </footer>
  );
}
