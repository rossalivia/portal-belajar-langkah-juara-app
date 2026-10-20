"use client";

import React, { useState } from "react";
import Link from "next/link";
import DashboardLayout from "../../components/DashboardLayout";
import StatCard from "../../components/StatCard";
import { useData } from "../../context/DataContext";
import {
  ShieldCheck,
  Users,
  UserCheck,
  TrendingUp,
  Building2,
  BookOpen,
  ArrowRight,
  BarChart3,
  Layers,
  PieChart,
  Percent,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Check,
} from "lucide-react";

export default function DasborSuperAdminPage() {
  const {
    isLoaded,
    users = [],
    program = [],
    pendaftaran = [],
    kelas = [],
    tugas = [],
    pengumpulan = [],
    penilaian = [],
    addProgram,
    updateProgram,
    deleteProgram,
  } = useData();

  // State Modal Program CRUD
  const [isAddProgramOpen, setIsAddProgramOpen] = useState(false);
  const [isSubmittingProgram, setIsSubmittingProgram] = useState(false);
  const [newProgramData, setNewProgramData] = useState({
    nama: "",
    deskripsi: "",
    biaya: "",
    durasi: "6 Bulan",
    target: "Siswa Kelas 12 & Gap Year",
    kuota: 50,
    fasilitas: "",
  });

  const [editingProgram, setEditingProgram] = useState(null);
  const [isEditingProgram, setIsEditingProgram] = useState(false);

  const [deletingProgram, setDeletingProgram] = useState(null);
  const [isDeletingProgram, setIsDeletingProgram] = useState(false);

  const handleAddProgramSubmit = async (e) => {
    e.preventDefault();
    if (!newProgramData.nama.trim() || !newProgramData.deskripsi.trim()) return;

    setIsSubmittingProgram(true);
    try {
      const res = await addProgram(newProgramData);
      if (res) {
        setIsAddProgramOpen(false);
        setNewProgramData({
          nama: "",
          deskripsi: "",
          biaya: "",
          durasi: "6 Bulan",
          target: "Siswa Kelas 12 & Gap Year",
          kuota: 50,
          fasilitas: "",
        });
      }
    } finally {
      setIsSubmittingProgram(false);
    }
  };

  const handleEditProgramSubmit = async (e) => {
    e.preventDefault();
    if (!editingProgram) return;

    setIsEditingProgram(true);
    try {
      const res = await updateProgram(editingProgram.id, {
        nama: editingProgram.nama,
        deskripsi: editingProgram.deskripsi,
        biaya: editingProgram.biaya,
        durasi: editingProgram.durasi,
        target: editingProgram.target,
        kuota: editingProgram.kuota,
        fasilitas: editingProgram.fasilitas,
      });
      if (res) {
        setEditingProgram(null);
      }
    } finally {
      setIsEditingProgram(false);
    }
  };

  const handleDeleteProgramConfirm = async () => {
    if (!deletingProgram) return;

    setIsDeletingProgram(true);
    try {
      const res = await deleteProgram(deletingProgram.id);
      if (res) {
        setDeletingProgram(null);
      }
    } finally {
      setIsDeletingProgram(false);
    }
  };

  const safeUsers = Array.isArray(users) ? users : [];
  const safePendaftaran = Array.isArray(pendaftaran) ? pendaftaran : [];
  const safeProgram = Array.isArray(program) ? program : [];
  const safeKelas = Array.isArray(kelas) ? kelas : [];
  const safeTugas = Array.isArray(tugas) ? tugas : [];
  const safePengumpulan = Array.isArray(pengumpulan) ? pengumpulan : [];
  const safePenilaian = Array.isArray(penilaian) ? penilaian : [];

  const totalUsers = safeUsers.length;
  const siswaCount = safeUsers.filter((u) => u.role === "siswa").length;
  const stafCount = safeUsers.filter((u) => u.role === "staf").length;
  const tutorCount = safeUsers.filter((u) => u.role === "tutor").length;
  const adminCount = safeUsers.filter((u) => u.role === "super_admin").length;

  const pendingDaftar = safePendaftaran.filter((p) => p.status === "menunggu").length;
  const approvedDaftar = safePendaftaran.filter((p) => p.status === "disetujui").length;
  const rejectedDaftar = safePendaftaran.filter((p) => p.status === "ditolak").length;
  const totalDaftar = safePendaftaran.length;

  const conversionRate =
    totalDaftar > 0 ? Math.round((approvedDaftar / totalDaftar) * 100) : 0;

  // Analitik Pendaftaran per Program Bimbel
  const programAnalytics = safeProgram.map((prog) => {
    const pendaftar = safePendaftaran.filter((p) => p.programId === prog.id);
    const approved = pendaftar.filter((p) => p.status === "disetujui").length;
    return {
      program: prog,
      total: pendaftar.length,
      approved,
      rate: pendaftar.length > 0 ? Math.round((approved / pendaftar.length) * 100) : 0,
    };
  });

  // Metrik Evaluasi Platform Keseluruhan
  const totalSubmissions = safePengumpulan.length;
  const totalGraded = safePenilaian.length;
  const gradingCompletionRate =
    totalSubmissions > 0 ? Math.round((totalGraded / totalSubmissions) * 100) : 0;

  // Kalkulasi Sudut Donut Chart untuk Distribusi Pengguna
  const siswaPct = totalUsers ? (siswaCount / totalUsers) * 100 : 0;
  const stafPct = totalUsers ? (stafCount / totalUsers) * 100 : 0;
  const tutorPct = totalUsers ? (tutorCount / totalUsers) * 100 : 0;
  const adminPct = totalUsers ? (adminCount / totalUsers) * 100 : 0;

  // Stroke-dasharray values for standard SVG circle r=40 (circumference ≈ 251.2)
  const circumference = 2 * Math.PI * 40;
  const siswaStroke = (siswaPct / 100) * circumference;
  const stafStroke = (stafPct / 100) * circumference;
  const tutorStroke = (tutorPct / 100) * circumference;
  const adminStroke = (adminPct / 100) * circumference;

  return (
    <DashboardLayout
      title="Dasbor Sentral Super Admin"
      subtitle="Analitik agregat pertumbuhan platform, distribusi hak akses akun Firestore, dan metrik pendaftaran."
      action={
        <div className="flex items-center gap-2">
          <Link
            href="/admin/pengguna"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs active:scale-95 duration-150 transition-all flex items-center gap-2"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Manajemen Pengguna & Role</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {!isLoaded ? (
          <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="h-28 bg-slate-200/70 rounded-xl" />
              <div className="h-28 bg-slate-200/70 rounded-xl" />
              <div className="h-28 bg-slate-200/70 rounded-xl" />
              <div className="h-28 bg-slate-200/70 rounded-xl" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-72 bg-slate-200/70 rounded-xl" />
              <div className="h-72 bg-slate-200/70 rounded-xl" />
            </div>
          </div>
        ) : (
          <>
            {/* Metrik Agregat Utama */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Pengguna"
                value={totalUsers}
                subtitle="Akun terdaftar di database"
                icon={Users}
                color="sky"
              />
              <StatCard
                title="Program Bimbel"
                value={safeProgram.length}
                subtitle="Katalog program aktif"
                icon={BookOpen}
                color="emerald"
              />
              <StatCard
                title="Pendaftaran Siswa"
                value={totalDaftar}
                subtitle={`${approvedDaftar} disetujui (${conversionRate}% rasio konversi)`}
                icon={UserCheck}
                color="purple"
                trend={conversionRate >= 50 ? `${conversionRate}% Konversi` : undefined}
              />
              <StatCard
                title="Kelas Belajar"
                value={safeKelas.length}
                subtitle={`${safeTugas.length} tugas & ${totalSubmissions} pengumpulan`}
                icon={Building2}
                color="rose"
              />
            </div>

        {/* SECTION 1: GRAFIK AGREGAT DISTRIBUSI PENGGUNA & METRIK PENDAFTARAN */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 1. Donut Chart Visual & Distribusi Peran Pengguna (PRD Bab 4.5) */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/60 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-blue-600" />
                    <h2 className="text-base font-bold text-slate-900">
                      Distribusi Peran Pengguna (Cloud Firestore)
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Grafik komposisi akun pengguna terdaftar berdasarkan hak akses sistem (PRD Bab 4.5).
                  </p>
                </div>
                <Link
                  href="/admin/pengguna"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors"
                >
                  Kelola Pengguna
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Grid 4 Kartu Breakdown Peran */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/60">
                  <span className="text-xs font-bold text-blue-800 uppercase tracking-wider block">
                    Siswa
                  </span>
                  <div className="text-2xl font-bold text-blue-900 mt-1">{siswaCount}</div>
                  <span className="text-[11px] text-blue-600 font-semibold">
                    {Math.round(siswaPct)}% dari total
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/60">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                    Staf Admisi
                  </span>
                  <div className="text-2xl font-bold text-emerald-900 mt-1">{stafCount}</div>
                  <span className="text-[11px] text-emerald-600 font-semibold">
                    {Math.round(stafPct)}% dari total
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/60">
                  <span className="text-xs font-bold text-purple-800 uppercase tracking-wider block">
                    Tutor
                  </span>
                  <div className="text-2xl font-bold text-purple-900 mt-1">{tutorCount}</div>
                  <span className="text-[11px] text-purple-600 font-semibold">
                    {Math.round(tutorPct)}% dari total
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/60">
                  <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block">
                    Super Admin
                  </span>
                  <div className="text-2xl font-bold text-rose-900 mt-1">{adminCount}</div>
                  <span className="text-[11px] text-rose-600 font-semibold">
                    {Math.round(adminPct)}% dari total
                  </span>
                </div>
              </div>

              {/* Visual Donut Chart & Stacked Bar Segments */}
              <div className="mt-6 p-5 rounded-2xl bg-[#F2F2F7]/50 border border-slate-200/60 flex flex-col sm:flex-row items-center gap-6">
                {/* Responsive SVG Donut Chart */}
                <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="text-slate-200 stroke-current"
                      strokeWidth="12"
                      fill="transparent"
                    />
                    {/* Siswa segment */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="text-blue-600 stroke-current transition-all duration-500"
                      strokeWidth="12"
                      strokeDasharray={`${siswaStroke} ${circumference}`}
                      strokeDashoffset="0"
                      fill="transparent"
                    />
                    {/* Staf segment */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="text-emerald-500 stroke-current transition-all duration-500"
                      strokeWidth="12"
                      strokeDasharray={`${stafStroke} ${circumference}`}
                      strokeDashoffset={`${-siswaStroke}`}
                      fill="transparent"
                    />
                    {/* Tutor segment */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="text-purple-600 stroke-current transition-all duration-500"
                      strokeWidth="12"
                      strokeDasharray={`${tutorStroke} ${circumference}`}
                      strokeDashoffset={`${-(siswaStroke + stafStroke)}`}
                      fill="transparent"
                    />
                    {/* Admin segment */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="text-rose-500 stroke-current transition-all duration-500"
                      strokeWidth="12"
                      strokeDasharray={`${adminStroke} ${circumference}`}
                      strokeDashoffset={`${-(siswaStroke + stafStroke + tutorStroke)}`}
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-base font-extrabold text-slate-900">{totalUsers}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Akun</span>
                  </div>
                </div>

                {/* Progress bar representasi distribusi */}
                <div className="flex-1 w-full space-y-2">
                  <div className="text-xs font-bold text-slate-700 flex justify-between">
                    <span>Proporsi Akun Pengguna Aktif:</span>
                    <span className="text-slate-500 font-normal">{totalUsers} Akun Terdaftar</span>
                  </div>

                  <div className="h-3 w-full rounded-full bg-slate-200/80 flex overflow-hidden">
                    <div
                      style={{ width: `${siswaPct}%` }}
                      className="bg-blue-600 transition-all duration-500"
                      title={`Siswa: ${siswaCount}`}
                    />
                    <div
                      style={{ width: `${stafPct}%` }}
                      className="bg-emerald-500 transition-all duration-500"
                      title={`Staf: ${stafCount}`}
                    />
                    <div
                      style={{ width: `${tutorPct}%` }}
                      className="bg-purple-600 transition-all duration-500"
                      title={`Tutor: ${tutorCount}`}
                    />
                    <div
                      style={{ width: `${adminPct}%` }}
                      className="bg-rose-500 transition-all duration-500"
                      title={`Admin: ${adminCount}`}
                    />
                  </div>

                  {/* Legend Labels */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-slate-600 font-medium">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Siswa ({siswaCount})
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Staf ({stafCount})
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-600" /> Tutor ({tutorCount})
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Admin ({adminCount})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-6 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
              <span>Perlu mengubah hak akses pengguna tertentu?</span>
              <Link href="/admin/pengguna" className="text-blue-600 font-semibold hover:text-blue-700">
                Ubah Role Pengguna &rarr;
              </Link>
            </div>
          </div>

          {/* 2. Ringkasan & Rasio Konversi Pendaftaran (PRD Bab 4.5) */}
          <div className="bg-white rounded-3xl border border-slate-200/60 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
            <div>
              <div className="pb-4 border-b border-slate-200/60 mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Status Konversi Pendaftaran
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Rasio verifikasi pengajuan bimbel siswa.
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  {conversionRate}% Rasio
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/60 bg-[#F2F2F7]/40">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-semibold text-slate-700">Disetujui</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
                    {approvedDaftar} Siswa
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/60 bg-[#F2F2F7]/40">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-semibold text-slate-700">Menunggu Review</span>
                  </div>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60">
                    {pendingDaftar} Siswa
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/60 bg-[#F2F2F7]/40">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span className="text-xs font-semibold text-slate-700">Ditolak</span>
                  </div>
                  <span className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200/60">
                    {rejectedDaftar} Siswa
                  </span>
                </div>
              </div>

              {/* Conversion bar progress */}
              <div className="mt-6 space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Tingkat Persetujuan Pendaftaran:</span>
                  <span className="text-emerald-700">{conversionRate}%</span>
                </div>
                <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${conversionRate}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 mt-6 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
              <span>{pendingDaftar} pendaftaran perlu review staf.</span>
              <Link href="/staf/pendaftaran" className="text-blue-600 font-semibold hover:text-blue-700">
                Buka Verifikasi &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* SECTION 2: ANALITIK PENDAFTARAN PER PROGRAM & EVALUASI PENUGASAN (PRD BAB 3) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pendaftaran per Katalog Program */}
          <div className="bg-white rounded-3xl border border-slate-200/60 p-6 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 mb-5">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Katalog Program Bimbingan Belajar
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F2F2F7] text-slate-700 border border-slate-200/50">
                  {safeProgram.length} Program
                </span>
                <button
                  onClick={() => setIsAddProgramOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all active:scale-95 duration-150"
                  title="Tambah Program Baru ke Cloud Firestore"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Program</span>
                </button>
              </div>
            </div>

            {programAnalytics.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                Belum ada program bimbingan belajar aktif.
              </p>
            ) : (
              <div className="space-y-4">
                {programAnalytics.map((item) => (
                  <div
                    key={item.program.id}
                    className="p-4 rounded-2xl border border-slate-200/60 bg-[#F2F2F7]/40 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          {item.program.nama}
                        </span>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          <span className="font-semibold text-blue-600">{item.program.biaya}</span> &bull; {item.program.durasi} &bull; Target: {item.program.target || "Semua Jenjang"}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => setEditingProgram(item.program)}
                          className="p-1.5 rounded-lg border border-slate-200/80 bg-white text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors shadow-xs"
                          title="Edit Program"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingProgram(item.program)}
                          className="p-1.5 rounded-lg border border-slate-200/80 bg-white text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors shadow-xs"
                          title="Hapus Program"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Rasio Peminatan Pendaftar:</span>
                      <span className="font-semibold text-slate-700">
                        {item.approved} disetujui / {item.total} pendaftar
                      </span>
                    </div>
                    <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-blue-600 transition-all duration-500"
                        style={{
                          width: `${
                            totalDaftar > 0 ? (item.total / totalDaftar) * 100 : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tingkat Penyelesaian & Evaluasi Tugas Platform */}
          <div className="bg-white rounded-3xl border border-slate-200/60 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 mb-5">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    Aktivitas Penugasan & Grading Platform
                  </h3>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200/60">
                  {gradingCompletionRate}% Dinilai
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5 text-center">
                <div className="p-3.5 bg-[#F2F2F7]/50 rounded-2xl border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Tugas Aktif
                  </span>
                  <div className="text-xl font-bold text-slate-900 mt-1">{safeTugas.length}</div>
                  <span className="text-[10px] text-slate-500 font-medium">Di seluruh kelas</span>
                </div>

                <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-200/60">
                  <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
                    Pengumpulan
                  </span>
                  <div className="text-xl font-bold text-blue-900 mt-1">{totalSubmissions}</div>
                  <span className="text-[10px] text-blue-600 font-semibold">Jawaban siswa</span>
                </div>

                <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200/60">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Selesai Dinilai
                  </span>
                  <div className="text-xl font-bold text-emerald-900 mt-1">{totalGraded}</div>
                  <span className="text-[10px] text-emerald-600 font-semibold">{gradingCompletionRate}%</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Progres Grading Tutor Platform:</span>
                  <span className="text-purple-700">{totalGraded} dari {totalSubmissions} Pengumpulan</span>
                </div>
                <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-2.5 rounded-full bg-purple-600 transition-all duration-500"
                    style={{ width: `${gradingCompletionRate}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 mt-6 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
              <span>Seluruh data analitik terhubung real-time ke Cloud Firestore.</span>
              <Link href="/tutor" className="text-blue-600 font-semibold hover:text-blue-700">
                Lihat Dasbor Tutor &rarr;
              </Link>
            </div>
          </div>
        </div>
        </>
        )}
      </div>

      {/* Modal Tambah Program Baru */}
      {isAddProgramOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-lg w-full p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/60">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Tambah Program Bimbingan Baru
                  </h3>
                  <p className="text-xs text-slate-500">
                    Mempublikasikan paket bimbingan belajar ke katalog platform
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddProgramOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddProgramSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nama Program <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newProgramData.nama}
                  onChange={(e) => setNewProgramData({ ...newProgramData, nama: e.target.value })}
                  placeholder="Contoh: Program Intensif UTBK SNBT 2026"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/80 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Deskripsi Lengkap <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={newProgramData.deskripsi}
                  onChange={(e) => setNewProgramData({ ...newProgramData, deskripsi: e.target.value })}
                  placeholder="Jelaskan fokus materi, silabus, dan target hasil belajar..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/80 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Biaya Pendaftaran / Program
                  </label>
                  <input
                    type="text"
                    value={newProgramData.biaya}
                    onChange={(e) => setNewProgramData({ ...newProgramData, biaya: e.target.value })}
                    placeholder="Contoh: Rp 3.500.000 atau 3500000"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/80 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Durasi Program
                  </label>
                  <input
                    type="text"
                    value={newProgramData.durasi}
                    onChange={(e) => setNewProgramData({ ...newProgramData, durasi: e.target.value })}
                    placeholder="Contoh: 6 Bulan atau 1 Tahun"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/80 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Target Peserta Siswa
                  </label>
                  <input
                    type="text"
                    value={newProgramData.target}
                    onChange={(e) => setNewProgramData({ ...newProgramData, target: e.target.value })}
                    placeholder="Contoh: Siswa Kelas 12 & Gap Year"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/80 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Kuota Maksimal Siswa
                  </label>
                  <input
                    type="number"
                    value={newProgramData.kuota}
                    onChange={(e) => setNewProgramData({ ...newProgramData, kuota: Number(e.target.value) || 0 })}
                    placeholder="50"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/80 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Fasilitas Unggulan (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={newProgramData.fasilitas}
                  onChange={(e) => setNewProgramData({ ...newProgramData, fasilitas: e.target.value })}
                  placeholder="Contoh: Tryout Mingguan IRT, Modul Cetak, Konsultasi Jurusan"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/80 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddProgramOpen(false)}
                  disabled={isSubmittingProgram}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProgram}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all active:scale-95 duration-150 disabled:opacity-50"
                >
                  {isSubmittingProgram ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Publikasikan Program</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Program */}
      {editingProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-lg w-full p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200/60">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Edit Detail Program Bimbel
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    ID: {editingProgram.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingProgram(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditProgramSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nama Program <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingProgram.nama || ""}
                  onChange={(e) => setEditingProgram({ ...editingProgram, nama: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/80 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Deskripsi Lengkap <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingProgram.deskripsi || ""}
                  onChange={(e) => setEditingProgram({ ...editingProgram, deskripsi: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/80 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Biaya Program
                  </label>
                  <input
                    type="text"
                    value={editingProgram.biaya || ""}
                    onChange={(e) => setEditingProgram({ ...editingProgram, biaya: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/80 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Durasi Program
                  </label>
                  <input
                    type="text"
                    value={editingProgram.durasi || ""}
                    onChange={(e) => setEditingProgram({ ...editingProgram, durasi: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/80 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Target Peserta Siswa
                  </label>
                  <input
                    type="text"
                    value={editingProgram.target || ""}
                    onChange={(e) => setEditingProgram({ ...editingProgram, target: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/80 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Kuota Siswa
                  </label>
                  <input
                    type="number"
                    value={editingProgram.kuota || 0}
                    onChange={(e) => setEditingProgram({ ...editingProgram, kuota: Number(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/80 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Fasilitas Unggulan (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={Array.isArray(editingProgram.fasilitas) ? editingProgram.fasilitas.join(", ") : (editingProgram.fasilitas || "")}
                  onChange={(e) => setEditingProgram({ ...editingProgram, fasilitas: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/80 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingProgram(null)}
                  disabled={isEditingProgram}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isEditingProgram}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-xs transition-all active:scale-95 duration-150 disabled:opacity-50"
                >
                  {isEditingProgram ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hapus Program */}
      {deletingProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-md w-full p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-600 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200/60 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Hapus Program Bimbel
                </h3>
                <p className="text-xs text-slate-500">
                  Program akan dihapus permanen dari katalog Cloud Firestore.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F2F2F7]/70 border border-slate-200/60 text-xs space-y-1 mb-5">
              <div className="font-bold text-slate-900">{deletingProgram.nama}</div>
              <div className="text-slate-600">{deletingProgram.biaya} &bull; {deletingProgram.durasi}</div>
              <div className="text-slate-500 font-mono text-[11px]">ID: {deletingProgram.id}</div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingProgram(null)}
                disabled={isDeletingProgram}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteProgramConfirm}
                disabled={isDeletingProgram}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition-all active:scale-95 duration-150 disabled:opacity-50"
              >
                {isDeletingProgram ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus Program</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
