"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useData } from "../context/DataContext";
import {
  Home,
  BookMarked,
  FileText,
  Award,
  UserCheck,
  Building2,
  PenTool,
  CheckSquare,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  CalendarCheck,
  Calendar,
  HelpCircle,
  LogOut,
  User,
  LayoutDashboard,
  Users,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, userProfile, authUser, logout } = useData();

  const userRole = currentUser?.role || userProfile?.role;
  const isSuperAdmin = userRole === "super_admin" || userRole === "admin";

  const handleLogout = async () => {
    await logout();
    router.push("/masuk");
  };

  const siswaLinks = [
    { href: "/beranda", label: "Ringkasan Belajar", icon: Home, exact: true },
    { href: "/beranda/program", label: "Pengajuan Program", icon: BookMarked },
    { href: "/beranda/tugas", label: "Daftar Tugas", icon: FileText },
    { href: "/beranda/nilai", label: "Rangkuman Nilai", icon: Award },
    { href: "/beranda/absen", label: "Rekap Kehadiran", icon: CalendarCheck },
    { href: "/beranda/jadwal", label: "Jadwal Pelajaran", icon: Calendar },
    { href: "/beranda/kuis", label: "Latihan Soal CBT", icon: HelpCircle },
  ];

  const stafLinks = [
    { href: "/staf", label: "Dasbor Staf", icon: BarChart3, exact: true },
    { href: "/staf/pendaftaran", label: "Persetujuan Siswa", icon: UserCheck },
    { href: "/staf/kelas", label: "Penempatan Kelas", icon: Building2 },
  ];

  const tutorLinks = [
    { href: "/tutor", label: "Dasbor Tutor", icon: BarChart3, exact: true },
    { href: "/tutor/tugas", label: "Pembuatan Tugas", icon: PenTool },
    { href: "/tutor/penilaian", label: "Grading & Feedback", icon: CheckSquare },
    { href: "/tutor/absen", label: "Presensi Siswa", icon: CalendarCheck },
  ];

  const adminLinks = [
    { href: "/admin", label: "Dasbor Utama", icon: LayoutDashboard, exact: true },
    { href: "/admin/pengguna", label: "Manajemen Pengguna", icon: Users, exact: true },
    { href: "/staf/kelas", label: "Manajemen Program & Kelas", icon: Building2, exact: true },
    { href: "/staf/pendaftaran", label: "Persetujuan Pendaftaran", icon: UserCheck, exact: true },
    { href: "/beranda/program", label: "Katalog Program Bimbel", icon: BookMarked, exact: true },
    { href: "/tutor/penilaian", label: "Rekap Nilai & Evaluasi", icon: Award, exact: true },
    { href: "/tutor/absen", label: "Monitoring Presensi", icon: CalendarCheck, exact: true },
  ];

  let currentSection = {
    title: "Modul Siswa",
    subtitle: "Akses Belajar & Penugasan",
    links: siswaLinks,
    badgeColor: "text-blue-700 bg-blue-50 ring-1 ring-inset ring-blue-600/20",
  };

  if (isSuperAdmin) {
    currentSection = {
      title: "Modul Super Admin",
      subtitle: "Sentral Kendali & Hak Akses",
      links: adminLinks,
      badgeColor: "text-rose-700 bg-rose-50 ring-1 ring-inset ring-rose-600/20",
    };
  } else if (pathname.startsWith("/staf") || userRole === "staf") {
    currentSection = {
      title: "Modul Staf",
      subtitle: "Administrasi & Penempatan",
      links: stafLinks,
      badgeColor: "text-emerald-700 bg-emerald-50 ring-1 ring-inset ring-emerald-600/20",
    };
  } else if (pathname.startsWith("/tutor") || userRole === "tutor") {
    currentSection = {
      title: "Modul Tutor",
      subtitle: "Pengajaran & Evaluasi",
      links: tutorLinks,
      badgeColor: "text-purple-700 bg-purple-50 ring-1 ring-inset ring-purple-600/20",
    };
  } else if (pathname.startsWith("/admin")) {
    currentSection = {
      title: "Modul Super Admin",
      subtitle: "Sentral Kendali & Hak Akses",
      links: adminLinks,
      badgeColor: "text-rose-700 bg-rose-50 ring-1 ring-inset ring-rose-600/20",
    };
  }

  const isLinkActive = (item) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <aside className="w-64 shrink-0 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 p-5 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* Module Header */}
        <div className="p-3.5 rounded-2xl border border-slate-200/60 bg-[#F2F2F7]/60">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Navigasi Modul
            </span>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${currentSection.badgeColor}`}
            >
              Aktif
            </span>
          </div>
          <h2 className="text-xs font-bold text-slate-900">{currentSection.title}</h2>
          <p className="text-[11px] text-slate-500">{currentSection.subtitle}</p>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {currentSection.links.map((item) => {
            const Icon = item.icon;
            const active = isLinkActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs transition-all duration-200 ${
                  active
                    ? "bg-blue-50 text-blue-600 font-semibold shadow-xs"
                    : "text-slate-600 hover:text-blue-600 hover:bg-slate-100/70 font-medium"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-blue-600" : "text-slate-400 group-hover:text-blue-600"}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Profile Card & Quick Logout Button */}
      {authUser && (
        <div className="pt-4 border-t border-slate-200/60 mt-auto space-y-2.5">
          <Link
            href="/profil"
            className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#F2F2F7]/60 hover:bg-[#F2F2F7] border border-slate-200/60 transition-colors group"
            title="Buka Pengaturan Profil"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {currentUser?.avatar || "US"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                {currentUser?.nama || "Pengguna"}
              </p>
              <span className="text-[9px] font-bold text-blue-700 uppercase tracking-wider block truncate">
                {currentUser?.role?.replace("_", " ") || "SISWA"}
              </span>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50/70 hover:bg-rose-100/70 rounded-xl transition-all active:scale-95 duration-150 border border-rose-200/60"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar dari Akun</span>
          </button>
        </div>
      )}
    </aside>
  );
}
