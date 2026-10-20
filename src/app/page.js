"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useData } from "../context/DataContext";
import { GraduationCap, Loader2 } from "lucide-react";

export default function RootPage() {
  const router = useRouter();
  const { authUser, currentUser, isLoadingAuth } = useData();

  useEffect(() => {
    // Tunggu sampai verifikasi autentikasi selesai
    if (isLoadingAuth) return;

    // Jika belum login, arahkan ke pintu masuk utama aplikasi (/masuk) sesuai PRD Bab 4.1
    if (!authUser) {
      router.replace("/masuk");
      return;
    }

    // Jika sudah login, arahkan langsung ke dasbor peran masing-masing
    const role = currentUser?.role;
    if (role === "staf") {
      router.replace("/staf");
    } else if (role === "tutor") {
      router.replace("/tutor");
    } else if (role === "super_admin" || role === "admin") {
      router.replace("/admin");
    } else {
      router.replace("/beranda");
    }
  }, [isLoadingAuth, authUser, currentUser, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 mb-6 animate-pulse">
        <GraduationCap className="w-8 h-8" />
      </div>
      <h1 className="text-xl font-bold tracking-tight text-slate-900">
        Langkah Juara
      </h1>
      <p className="text-xs text-slate-500 mt-1">
        Portal Belajar & Manajemen Bimbingan Belajar Terpadu
      </p>

      <div className="mt-6 flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-xs text-slate-600 text-xs font-medium">
        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
        <span>Mengarahkan ke pintu masuk portal...</span>
      </div>
    </div>
  );
}
