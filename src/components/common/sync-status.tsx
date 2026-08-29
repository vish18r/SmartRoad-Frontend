"use client";

import { useEffect, useState } from "react";

export function SyncStatus() { const [online, setOnline] = useState(true); useEffect(() => { const update = () => setOnline(window.navigator.onLine); update(); window.addEventListener("online", update); window.addEventListener("offline", update); return () => { window.removeEventListener("online", update); window.removeEventListener("offline", update); }; }, []); return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${online ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>{online ? "Online" : "Offline: changes wait for sync"}</span>; }
