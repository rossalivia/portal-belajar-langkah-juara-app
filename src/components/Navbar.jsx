"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useData } from "../context/DataContext";
import {
  GraduationCap,
  ChevronDown,
  LayoutDashboard,
  ArrowRight,
  LogOut,
  User,
  Shield,
  Circle,
  Menu,
  X,
  Bell,
  CheckCheck,
  Inbox,
  ExternalLink,
} from "lucide-react";
import { formatDateTime } from "../lib/dateUtils";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    currentUser,
    userProfile,
    authUser,
    isLoadingAuth,
    logout,
    notifikasi = [],
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useData();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const userRole = currentUser?.role || userProfile?.role;
  const isSuperAdmin = userRole === "super_admin" || userRole === "admin";

  const unreadCount = Array.isArray(notifikasi)
    ? notifikasi.filter((n) => !n.dibaca).length
    : 0;

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsNotifOpen(false);
    setIsDropdownOpen(false);
  }, [pathname]);

  const getActiveRoleLabel = () => {
    if (isSuperAdmin || pathname.startsWith("/admin"))
      return { label: "Modul Super Admin", color: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20" };
    if (pathname.startsWith("/staf"))
      return { label: "Modul Staf Admisi", color: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20" };
    if (pathname.startsWith("/tutor"))
      return { label: "Modul Tutor", color: "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20" };
    if (pathname.startsWith("/beranda"))
      return { label: "Modul Siswa", color: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20" };
    return { label: "Portal Publik", color: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-500/20" };
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case "staf":
        return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20";
      case "tutor":
        return "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20";
      case "super_admin":
      case "admin":
        return "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20";
      case "siswa":
      default:
        return "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20";
    }
  };

  const activeBadge = getActiveRoleLabel();

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
    router.push("/masuk");
  };

  const getDashboardHref = (role) => {
    if (role === "staf") return "/staf";
    if (role === "tutor") return "/tutor";
    if (role === "super_admin" || role === "admin") return "/admin";
    return "/beranda";
  };

  const getSubLinks = () => {
    if (isSuperAdmin || pathname.startsWith("/admin")) {
      return [
        { href: "/admin", label: "Dasbor Utama" },
        { href: "/admin/pengguna", label: "Manajemen Pengguna" },
        { href: "/staf/kelas", label: "Manajemen Program & Kelas" },
        { href: "/staf/pendaftaran", label: "Persetujuan Pendaftaran" },
        { href: "/beranda/program", label: "Katalog Program Bimbel" },
        { href: "/tutor/penilaian", label: "Rekap Nilai & Evaluasi" },
        { href: "/tutor/absen", label: "Monitoring Presensi" },
      ];
    }
    if (pathname.startsWith("/staf") || userRole === "staf") {
      return [
        { href: "/staf", label: "Dasbor Staf" },
        { href: "/staf/pendaftaran", label: "Persetujuan Siswa" },
        { href: "/staf/kelas", label: "Penempatan Kelas" },
      ];
    }
    if (pathname.startsWith("/tutor") || userRole === "tutor") {
      return [
        { href: "/tutor", label: "Dasbor Tutor" },
        { href: "/tutor/tugas", label: "Pembuatan Tugas" },
        { href: "/tutor/penilaian", label: "Grading & Feedback" },
        { href: "/tutor/absen", label: "Presensi Siswa" },
      ];
    }
    if (pathname.startsWith("/beranda") || userRole === "siswa") {
      return [
        { href: "/beranda", label: "Ringkasan Belajar" },
        { href: "/beranda/program", label: "Pengajuan Program" },
        { href: "/beranda/tugas", label: "Daftar Tugas" },
        { href: "/beranda/nilai", label: "Rangkuman Nilai" },
        { href: "/beranda/absen", label: "Rekap Kehadiran" },
        { href: "/beranda/jadwal", label: "Jadwal Pelajaran" },
        { href: "/beranda/kuis", label: "Latihan Soal CBT" },
      ];
    }
    return [
      { href: "/masuk", label: "Masuk ke Akun" },
      { href: "/daftar", label: "Daftar Akun Baru" },
    ];
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Corporate Brand Identity */}
          <div className="flex items-center gap-3.5">
            <Link
              href={authUser ? getDashboardHref(currentUser?.role) : "/masuk"}
              className="flex items-center gap-2.5 group"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white shadow-xs transition-colors duration-200">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors duration-200">
                  Langkah Juara
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                  Portal Belajar
                </span>
              </div>
            </Link>

            {authUser && !["/masuk", "/daftar"].includes(pathname) && (
              <span
                className={`hidden md:inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full ${activeBadge.color}`}
              >
                {activeBadge.label}
              </span>
            )}
          </div>

          {/* User Profile & Auth Actions */}
          <div className="flex items-center gap-2.5">
            {/* Sistem Notifikasi In-App (Lonceng Notifikasi) */}
            {authUser && !isLoadingAuth && (
              <div className="relative">
                <button
                  onClick={() => {
                    setIsNotifOpen(!isNotifOpen);
                    setIsDropdownOpen(false);
                  }}
                  className="relative p-2.5 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-100/70 transition-colors focus:ring-2 focus:ring-blue-500/20 active:scale-95 duration-150"
                  aria-label="Notifikasi In-App"
                  title="Notifikasi Masuk"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {isNotifOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsNotifOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200/60 z-40 animate-in fade-in zoom-in-95 overflow-hidden">
                      {/* Header Dropdown */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-[#F2F2F7]/50">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-bold text-slate-800">
                            Notifikasi
                          </span>
                          {unreadCount > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                              {unreadCount} belum dibaca
                            </span>
                          )}
                        </div>

                        {unreadCount > 0 && (
                          <button
                            onClick={() => markAllNotificationsAsRead()}
                            className="flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-800 transition-colors"
                            title="Tandai semua notifikasi sudah dibaca"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>Tandai Semua Dibaca</span>
                          </button>
                        )}
                      </div>

                      {/* Notifikasi List */}
                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifikasi.length === 0 ? (
                          <div className="py-8 px-4 text-center">
                            <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-xs font-medium text-slate-600">
                              Belum ada notifikasi
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Pemberitahuan pendaftaran, tugas, dan nilai akan muncul di sini.
                            </p>
                          </div>
                        ) : (
                          notifikasi.map((item) => {
                            const isUnread = !item.dibaca;
                            const targetUrl = item.tautan || item.Tautan || "/beranda";

                            return (
                              <div
                                key={item.id}
                                onClick={() => {
                                  if (isUnread) {
                                    markNotificationAsRead(item.id);
                                  }
                                  setIsNotifOpen(false);
                                  if (targetUrl && targetUrl !== "#") {
                                    router.push(targetUrl);
                                  }
                                }}
                                className={`px-4 py-3 cursor-pointer transition-colors duration-150 flex items-start gap-3 ${
                                  isUnread
                                    ? "bg-blue-50/40 hover:bg-blue-50/70"
                                    : "bg-white hover:bg-slate-50"
                                }`}
                              >
                                <div className="mt-1">
                                  {isUnread ? (
                                    <span className="w-2 h-2 rounded-full bg-blue-600 block shadow-xs ring-4 ring-blue-100" />
                                  ) : (
                                    <span className="w-2 h-2 rounded-full bg-slate-300 block" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={`text-xs leading-relaxed ${
                                      isUnread
                                        ? "font-semibold text-slate-900"
                                        : "font-normal text-slate-700"
                                    }`}
                                  >
                                    {item.pesan}
                                  </p>
                                  <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                                    <span>{formatDateTime(item.createdAt)}</span>
                                    {targetUrl && targetUrl !== "#" && (
                                      <span className="text-blue-600 flex items-center gap-0.5 font-medium hover:underline">
                                        Buka <ExternalLink className="w-2.5 h-2.5" />
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Dropdown Footer */}
                      <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Langkah Juara Cloud In-App</span>
                        <button
                          onClick={() => setIsNotifOpen(false)}
                          className="font-medium text-slate-600 hover:text-slate-900"
                        >
                          Tutup
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Profile Dropdown */}
            {isLoadingAuth ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 animate-pulse">
                <div className="w-7 h-7 rounded-md bg-slate-200" />
                <div className="hidden sm:block space-y-1">
                  <div className="w-16 h-2.5 bg-slate-200 rounded" />
                  <div className="w-10 h-2 bg-slate-200 rounded" />
                </div>
              </div>
            ) : authUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/80 transition-all duration-200 text-left focus:ring-2 focus:ring-blue-500/20"
                  aria-label="Profil Pengguna"
                >
                  <div className="relative">
                    <div className="w-7 h-7 rounded-md bg-blue-600 text-white flex items-center justify-center font-semibold text-xs shrink-0 shadow-xs">
                      {currentUser?.avatar || "US"}
                    </div>
                    <span
                      title="Cloud Firestore Terhubung"
                      className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white"
                    />
                  </div>
                  <div className="hidden sm:block text-xs">
                    <div className="font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
                      {currentUser?.nama || "Pengguna"}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider ${getRoleBadgeStyle(
                          currentUser?.role
                        )}`}
                      >
                        {currentUser?.role?.replace("_", " ") || "SISWA"}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/60 p-2.5 z-40 animate-in fade-in zoom-in-95">
                      {/* User Info Header */}
                      <div className="px-3 py-2.5 border-b border-slate-100">
                        <div className="flex items-center gap-2.5 mb-1.5">
                          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-semibold text-xs shrink-0 shadow-xs">
                            {currentUser?.avatar || "US"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-900 truncate">
                              {currentUser?.nama || "Pengguna"}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {currentUser?.email || authUser?.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getRoleBadgeStyle(
                              currentUser?.role
                            )}`}
                          >
                            Peran: {currentUser?.role?.replace("_", " ") || "SISWA"}
                          </span>
                          <span className="text-[10px] font-medium text-emerald-700 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Firestore
                          </span>
                        </div>
                      </div>

                      {/* Direct Dashboard Link */}
                      <div className="py-1.5 space-y-1">
                        <Link
                          href={getDashboardHref(currentUser?.role)}
                          onClick={() => setIsDropdownOpen(false)}
                          className="w-full flex items-center justify-between px-3 py-2 text-xs text-blue-700 hover:bg-blue-50/80 rounded-xl transition-colors duration-200 font-medium"
                        >
                          <span className="flex items-center gap-2">
                            <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />
                            Dasbor {currentUser?.role?.replace("_", " ")}
                          </span>
                          <ArrowRight className="w-3 h-3 text-blue-400" />
                        </Link>
                        <Link
                          href="/profil"
                          onClick={() => setIsDropdownOpen(false)}
                          className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-700 hover:bg-slate-100/70 rounded-xl transition-colors duration-200 font-medium"
                        >
                          <span className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-slate-500" />
                            Pengaturan Profil
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                        </Link>
                      </div>

                      {/* Logout Action */}
                      <div className="pt-1.5 border-t border-slate-100">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50/80 rounded-xl transition-all active:scale-95 duration-150 font-medium w-full"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Keluar dari Akun
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Public Links when not logged in */
              <div className="flex items-center gap-2">
                <Link
                  href="/masuk"
                  className="text-xs font-semibold px-4 py-2 text-slate-700 hover:text-blue-600 rounded-xl hover:bg-slate-100/70 transition-all duration-200 active:scale-95"
                >
                  Masuk
                </Link>
                <Link
                  href="/daftar"
                  className="text-xs font-semibold px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-all duration-200 active:scale-95 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Daftar
                </Link>
              </div>
            )}

            {/* Logout shortcut if logged in */}
            {authUser && (
              <div className="flex items-center pl-2 border-l border-slate-200/60">
                <button
                  onClick={handleLogout}
                  title="Keluar dari Akun"
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50/70 rounded-xl transition-all active:scale-95 duration-150"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            )}
            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-colors ml-1 active:scale-95"
              aria-label="Toggle Mobile Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-slate-800" />
              ) : (
                <Menu className="w-5 h-5 text-slate-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border border-slate-200/60 bg-white/95 backdrop-blur-xl px-4 py-4 space-y-4 rounded-2xl shadow-xl animate-in slide-in-from-top-2 duration-200 my-2">
            {authUser ? (
              <>
                {/* User Info Header */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F2F2F7]/70 border border-slate-200/60">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-semibold text-xs shrink-0 shadow-xs">
                    {currentUser?.avatar || "US"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-slate-800 truncate">
                      {currentUser?.nama || "Pengguna"}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase font-medium">
                      Peran: {currentUser?.role?.replace("_", " ") || "SISWA"}
                    </div>
                  </div>
                </div>

                {/* Sub-menu Halaman Modul Aktif */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Navigasi Halaman
                    </span>
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${activeBadge.color}`}>
                      {activeBadge.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {getSubLinks().map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                            isActive
                              ? "bg-blue-50 text-blue-700 font-semibold border border-blue-200/70 shadow-xs"
                              : "text-slate-700 bg-[#F2F2F7]/50 hover:bg-[#F2F2F7] border border-slate-200/60"
                          }`}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Profile & Logout Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2.5">
                  <Link
                    href="/profil"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1 py-2.5 text-center text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>Profil</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex-1 py-2.5 text-center text-xs text-rose-600 hover:bg-rose-50 rounded-xl font-semibold border border-rose-200/60 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar</span>
                  </button>
                </div>
              </>
            ) : (
              /* Public Mobile Menu */
              <div className="space-y-3">
                <p className="text-xs text-slate-500 text-center">
                  Selamat datang di Portal Belajar Langkah Juara
                </p>
                <div className="flex items-center gap-2">
                  <Link
                    href="/masuk"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1 py-2.5 text-center text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all active:scale-95"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/daftar"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1 py-2.5 text-center text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all active:scale-95 shadow-xs"
                  >
                    Daftar Siswa Baru
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
