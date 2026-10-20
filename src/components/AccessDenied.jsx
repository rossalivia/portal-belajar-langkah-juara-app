"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useData } from "../context/DataContext";
import Navbar from "./Navbar";
import {
  ShieldAlert,
  ArrowRight,
  Home,
  LogOut,
  User,
  LayoutDashboard,
} from "lucide-react";

export default function AccessDenied({ pathname, allowedRoles = [] }) {
  const router = useRouter();
  const { currentUser, userProfile, authUser, logout } = useData();
  const activeRole = userProfile?.role || currentUser?.role || "siswa";

  const getDashboardHref = (role) => {
    if (role === "staf") return "/staf";
    if (role === "tutor") return "/tutor";
    if (role === "super_admin" || role === "admin") return "/admin";
    return "/beranda";
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "siswa":
        return "Siswa";
      case "staf":
        return "Staf Admisi";
      case "tutor":
        return "Tutor";
      case "super_admin":
      case "admin":
        return "Super Admin";
      default:
        return role || "Pengguna";
    }
  };

  const handleLogoutAndSwitch = async () => {
    await logout();
    router.push("/masuk");
  };

  const formattedAllowed = allowedRoles
    .map((r) => getRoleLabel(r))
    .join(" atau ");

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 text-center space-y-6">
          {/* Icon Shield Alert */}
          <div className="inline-flex w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 items-center justify-center text-rose-600 shadow-xs">
            <ShieldAlert className="w-7 h-7" />
          </div>

          {/* Heading */}
          <div className="space-y-1.5">
            <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
              403 Forbidden &bull; Hak Akses Dibatasi
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
              Akses Ditolak
            </h1>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Anda tidak memiliki izin untuk mengakses halaman ini. Halaman ini hanya diperuntukkan bagi pengguna dengan peran tertentu.
            </p>
          </div>

          {/* User & Route Information Box */}
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 text-left space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Nama Akun:</span>
              <span className="font-semibold text-slate-800">
                {currentUser?.nama || "Pengguna"}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Email:</span>
              <span className="font-semibold text-slate-800">
                {currentUser?.email || authUser?.email || "-"}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Peran Akun Anda:</span>
              <span className="font-bold px-2 py-0.5 rounded text-[11px] bg-slate-200 text-slate-800 uppercase">
                {getRoleLabel(activeRole)} ({activeRole})
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Rute Diminta:</span>
              <span className="font-mono text-[11px] text-slate-600 font-semibold">
                {pathname || "-"}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500">Peran yang Diizinkan:</span>
              <span className="font-semibold text-sky-700">
                {formattedAllowed || "-"}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <Link
              href={getDashboardHref(activeRole)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Buka Dasbor {getRoleLabel(activeRole)}</span>
            </Link>

            <Link
              href="/"
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4 text-slate-400" />
              <span>Beranda Publik</span>
            </Link>
          </div>

          {/* Switch Account */}
          <div className="pt-2 border-t border-slate-100 text-center">
            <button
              onClick={handleLogoutAndSwitch}
              className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar dan Masuk dengan Akun Lain</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
