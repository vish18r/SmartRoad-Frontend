"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export function BrandLogo({ href = "/", compact = false, darkSurface = false }: { href?: string; compact?: boolean; darkSurface?: boolean }) {
  const [imageFailed, setImageFailed] = useState(false);
  return <Link href={href} aria-label="SmartRoad home" className={`inline-flex items-center ${compact ? "h-10 w-10" : "h-24 w-24"}`}>
    {!imageFailed ? <Image src="/logo/smartroad.svg" alt="SmartRoad - Building roads, building futures" width={768} height={768} priority={href === "/"} onError={() => setImageFailed(true)} className="h-full w-full object-contain object-left" /> : <span className={`text-xl font-bold tracking-tight ${darkSurface ? "text-white" : "text-slate-900"}`}>SMART<span className="text-orange-500">ROAD</span></span>}
  </Link>;
}
