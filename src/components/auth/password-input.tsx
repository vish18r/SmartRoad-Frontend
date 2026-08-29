"use client";
import { useState } from "react";

export function PasswordInput({ label, value, onChange, disabled, autoComplete = "current-password" }: { label: string; value: string; onChange: (value: string) => void; disabled?: boolean; autoComplete?: string }) {
  const [visible, setVisible] = useState(false);
  return <label className="block text-sm font-medium text-slate-700">{label}<span className="relative mt-1 block"><input required disabled={disabled} autoComplete={autoComplete} type={visible ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-16 outline-none focus:border-orange-500" /><button type="button" disabled={disabled} onClick={() => setVisible(!visible)} className="absolute inset-y-0 right-2 text-xs font-medium text-slate-600">{visible ? "Hide" : "Show"}</button></span></label>;
}
