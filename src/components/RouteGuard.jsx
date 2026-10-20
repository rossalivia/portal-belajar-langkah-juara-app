"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useData } from "../context/DataContext";
import AccessDenied from "./AccessDenied";
import Link from "next/link";
import { Loader2, Lock, ArrowRight, ShieldCheck } from "lucide-react";

/**
 * Pemetaan wewenang peran resmi untuk rute terproteksi:
 * Super Admin ('super_admin') memiliki wewenang penuh di seluruh rute.
 */
export function getAllowedRoles(path) {
  if (path.startsWith("/beranda") || path.startsWith("/program") || path.startsWith("/kelas")) {
    return ["siswa", "super_admin"];
  }
  if (path.startsWith("/staf")) {
    return ["staf", "super_admin"];
  }
  if (path.startsWith("/tutor")) {
    return ["tutor", "super_admin"];
  }
  if (path.startsWith("/admin")) {
    return ["super_admin", "admin"];
  }
  if (path.startsWith("/profil")) {
    return ["siswa", "staf", "tutor", "super_admin", "admin"];
  }
  if (path.startsWith("/tugas")) {
    return ["siswa", "tutor", "super_admin"];
  }
  return null; // Rute publik (/masuk, /daftar, /)
}

export default function RouteGuard({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    authUser,
    currentUser,
    userProfile,
    isLoadingAuth,
    isRoleLoading,
    logout,
  } = useData();

  const allowedRoles = getAllowedRoles(pathname);

  // ATURAN 1: Status loading mutlak selama status login maupun peran (role) dari Firestore sedang dibaca.
  // Jangan memutuskan redirect atau Akses Ditolak sebelum proses pembacaan selesai (mencegah kedipan layar saat F5/refresh).
  const isVerifyingAccess =
    isLoadingAuth || (Boolean(authUser) && (isRoleLoading || !userProfile));

  useEffect(() => {
    // Tahan seluruh keputusan navigasi jika verifikasi hak akses belum tuntas
    if (isVerifyingAccess) return;

    // Jika akun terdeteksi nonaktif, paksa logout dan arahkan ke /masuk
    if (authUser && (userProfile?.aktif === false || currentUser?.aktif === false)) {
      logout();
      router.replace("/masuk");
      return;
    }

    // Penanganan rute shortcut / pengalihan ke URL resmi
    if (pathname === "/tugas") {
      router.replace("/beranda/tugas");
      return;
    }
    if (pathname === "/program") {
      router.replace("/beranda/program");
      return;
    }
    if (pathname === "/kelas") {
      router.replace("/beranda");
      return;
    }

    // ATURAN 2: Jika pengguna belum login (anonim) dan berada di rute terproteksi, arahkan otomatis ke /masuk
    if (allowedRoles && !authUser) {
      router.replace("/masuk");
    }
  }, [
    isVerifyingAccess,
    authUser,
    userProfile,
    currentUser,
    allowedRoles,
    router,
    logout,
    pathname,
  ]);

  // 1. Tampilkan indikator memuat / loading selama proses pembacaan role dari users/{uid} berlangsung
  if (isVerifyingAccess) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 items-center justify-center p-6 text-center animate-in fade-in">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4 shadow-xs">
          <Loader2 className="w-7 h-7 animate-spin" />
        </div>
        <h2 className="text-sm font-bold text-slate-800">
          Memverifikasi Hak Akses...
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Sedang membaca profil dan wewenang akun dari Cloud Firestore
        </p>
      </div>
    );
  }

  // 2. Jika pengguna belum login dan berada di rute terproteksi, tampilkan status pengalihan
  if (allowedRoles && !authUser) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 items-center justify-center p-6 text-center animate-in fade-in">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-4 shadow-xs">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-sm font-bold text-slate-800">
          Memerlukan Autentikasi
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Sesi pengguna belum aktif. Mengarahkan Anda ke halaman masuk...
        </p>
        <div className="mt-5">
          <Link
            href="/masuk"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <span>Buka Halaman Masuk</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // 3. Jika akun pengguna dinonaktifkan (aktif: false)
  if (authUser && (userProfile?.aktif === false || currentUser?.aktif === false)) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 items-center justify-center p-6 text-center animate-in fade-in">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-4 shadow-xs">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-sm font-bold text-slate-800">
          Akun Dinonaktifkan
        </h2>
        <p className="text-xs text-rose-600 font-semibold mt-1 max-w-sm">
          Akun Anda dinonaktifkan. Hubungi staf Langkah Juara
        </p>
      </div>
    );
  }

  // 4. Evaluasi Otorisasi Hak Akses (Pengguna Sudah Login)
  if (authUser) {
    const userRole = userProfile?.role || currentUser?.role;

    // ATURAN MUTLAK: Super Admin memiliki akses penuh ke seluruh rute tanpa pengecualian
    if (userRole === "super_admin" || userRole === "admin") {
      return <>{children}</>;
    }

    // Jika bukan super_admin dan role tidak termasuk dalam allowedRoles, tampilkan AccessDenied (403)
    if (allowedRoles && (!userRole || !allowedRoles.includes(userRole))) {
      return <AccessDenied pathname={pathname} allowedRoles={allowedRoles} />;
    }
  }

  // 5. Akses diberikan
  return <>{children}</>;
}
