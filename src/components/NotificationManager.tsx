"use client";

import React from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";

export default function NotificationManager() {
  const { notifications, removeNotification } = useNotifications();

  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-[200] flex flex-col gap-4 w-full max-w-sm pointer-events-none">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="pointer-events-auto animate-in slide-in-from-right-full duration-300"
        >
          <div className="relative overflow-hidden bg-[#020617]/95 border border-slate-800 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md">
            {/* Barra de Progresso Decorativa */}
            <div className={`absolute bottom-0 left-0 h-1 bg-current opacity-20 animate-out fade-out duration-[5000ms]`} style={{ width: '100%' }} />
            
            <div className="flex gap-4">
              <div className={
                n.type === "success" ? "text-green-500" : 
                n.type === "error" ? "text-red-500" : "text-cyan-500"
              }>
                {n.type === "success" ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
              </div>

              <div className="flex-1 space-y-1">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white italic">
                  {n.title}
                </h4>
                <p className="text-[11px] font-bold text-slate-400 leading-tight uppercase">
                  {n.message}
                </p>
              </div>

              <button 
                onClick={() => removeNotification(n.id)}
                className="text-slate-600 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}