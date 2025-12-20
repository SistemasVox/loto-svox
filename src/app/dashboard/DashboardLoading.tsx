"use client";

import React, { useEffect, useState } from "react";

export default function DashboardLoading({ children }: { children: React.ReactNode }) {
  const [showLoading, setShowLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setShowLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);
  if (showLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <svg className="animate-spin h-14 w-14 text-blue-500 mb-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#ccc" strokeWidth="4" fill="none" />
          <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
        </svg>
        <span className="text-xl font-semibold text-white mb-2">Dashboard</span>
        <span className="text-lg text-gray-300 mb-1">Carregando painel…</span>
        <span className="text-sm text-gray-500">Aguarde, pode demorar alguns segundos :)</span>
      </div>
    );
  }
  return <>{children}</>;
}
