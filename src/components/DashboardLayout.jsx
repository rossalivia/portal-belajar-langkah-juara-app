"use client";

import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import RouteGuard from "./RouteGuard";

export default function DashboardLayout({ children, title, subtitle, action }) {
  return (
    <RouteGuard>
      <div className="min-h-screen flex flex-col bg-[#F2F2F7]">
        <Navbar />
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          <Sidebar />
          <main className="flex-1 p-5 sm:p-6 lg:p-8 min-w-0">
            {(title || action) && (
              <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
                <div>
                  {title && (
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed max-w-3xl">
                      {subtitle}
                    </p>
                  )}
                </div>
                {action && <div className="shrink-0">{action}</div>}
              </div>
            )}
            {children}
          </main>
        </div>
      </div>
    </RouteGuard>
  );
}
