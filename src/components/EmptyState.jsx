import React from "react";
import Link from "next/link";
import { FolderOpen } from "lucide-react";

export default function EmptyState({
  title = "Belum Ada Data",
  description = "Belum ada rekaman yang dapat ditampilkan saat ini.",
  icon: Icon = FolderOpen,
  actionLabel,
  actionHref,
  onAction,
}) {
  return (
    <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-10 sm:p-14 text-center flex flex-col items-center justify-center my-4 transition-all">
      <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100/80 flex items-center justify-center text-blue-600 mb-4 shadow-xs">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mt-1.5 mb-6 leading-relaxed">
        {description}
      </p>

      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-xs hover:shadow transition-all active:scale-95 duration-150 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <span>{actionLabel}</span>
        </Link>
      )}

      {actionLabel && onAction && !actionHref && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-xs hover:shadow transition-all active:scale-95 duration-150 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
