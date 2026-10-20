"use client";

import React from "react";
import { useData } from "../context/DataContext";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export default function ToastContainer() {
  const { toasts, removeToast } = useData();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success";
        const isError = toast.type === "error";

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-top-3 fade-in ${
              isSuccess
                ? "bg-slate-900/95 text-slate-100 border-emerald-500/40 ring-1 ring-emerald-500/20 shadow-emerald-950/20"
                : isError
                ? "bg-slate-900/95 text-slate-100 border-rose-500/40 ring-1 ring-rose-500/20 shadow-rose-950/20"
                : "bg-slate-900/95 text-slate-100 border-blue-500/40 ring-1 ring-blue-500/20 shadow-blue-950/20"
            }`}
          >
            <div
              className={`p-1.5 rounded-xl shrink-0 mt-0.5 ${
                isSuccess
                  ? "bg-emerald-500/20 text-emerald-400"
                  : isError
                  ? "bg-rose-500/20 text-rose-400"
                  : "bg-blue-500/20 text-blue-400"
              }`}
            >
              {isSuccess && <CheckCircle2 className="w-4 h-4" />}
              {isError && <AlertCircle className="w-4 h-4" />}
              {!isSuccess && !isError && <Info className="w-4 h-4" />}
            </div>

            <div className="flex-1 min-w-0">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider block mb-0.5 ${
                  isSuccess
                    ? "text-emerald-400"
                    : isError
                    ? "text-rose-400"
                    : "text-blue-400"
                }`}
              >
                {isSuccess ? "Aksi Berhasil" : isError ? "Terjadi Kendala" : "Informasi"}
              </span>
              <p className="text-xs font-medium leading-relaxed text-slate-200">
                {toast.message}
              </p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 shrink-0"
              aria-label="Tutup notifikasi"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
