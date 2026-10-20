"use client";

import React from "react";
import Link from "next/link";
import DashboardLayout from "../../components/DashboardLayout";
import StatCard from "../../components/StatCard";
import EmptyState from "../../components/EmptyState";
import { useData } from "../../context/DataContext";
import {
  GraduationCap,
  BookOpen,
  FileText,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { formatDateOnly } from "../../lib/dateUtils";

export default function BerandaSiswaPage() {
  const {
    currentUser,
    pendaftaran = [],
    program = [],
    kelas = [],
    tugas = [],
    pengumpulan = [],
    penilaian = [],
    isLoaded,
  } = useData();

  const safePendaftaran = Array.isArray(pendaftaran) ? pendaftaran : [];
  const safeProgram = Array.isArray(program) ? program : [];
  const safeKelas = Array.isArray(kelas) ? kelas : [];
  const safeTugas = Array.isArray(tugas) ? tugas : [];
  const safePengumpulan = Array.isArray(pengumpulan) ? pengumpulan : [];
  const safePenilaian = Array.isArray(penilaian) ? penilaian : [];

  // Filter data untuk siswa yang sedang aktif
  const myPendaftaran = safePendaftaran.filter((p) => p.siswaId === currentUser?.id);
  const approvedPendaftaran = myPendaftaran.filter((p) => p.status === "disetujui");

  // Kelas dimana siswa terdaftar
  const myKelas = safeKelas.filter((k) => k?.siswaIds?.includes(currentUser?.id));
  const myKelasIds = myKelas.map((k) => k.id);

  // Tugas untuk kelas siswa (hanya untuk kelas di mana siswa terdaftar, menjaga kerahasiaan data sesuai Bab 6 PRD)
  const myTugas = myKelasIds.length > 0
    ? safeTugas.filter((t) => myKelasIds.includes(t.kelasId))
    : [];

  // Pengumpulan tugas siswa
  const myPengumpulan = safePengumpulan.filter((p) => p.siswaId === currentUser?.id);
  const submittedTugasIds = myPengumpulan.map((p) => p.tugasId);

  // Tugas pending (belum dikerjakan)
  const pendingTugas = myTugas.filter((t) => !submittedTugasIds.includes(t.id));

  // Nilai tugas siswa
  const myPenilaian = safePenilaian.filter((pen) => {
    const submit = myPengumpulan.find((p) => p.id === pen.pengumpulanId);
    return !!submit;
  });

  const averageScore =
    myPenilaian.length > 0
      ? Math.round(myPenilaian.reduce((acc, curr) => acc + curr.nilai, 0) / myPenilaian.length)
      : null;

  return (
    <DashboardLayout
      title={`Selamat Datang, ${currentUser?.nama || "Siswa"}`}
      subtitle="Dasbor Utama Siswa: Metrik ringkasan kemajuan belajar dan aktivitas bimbingan."
      action={
        <div className="flex items-center gap-2">
          <Link
            href="/beranda/program"
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-sm transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Ajukan Program</span>
          </Link>
          <Link
            href="/beranda/tugas"
            className="px-4 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs shadow-sm transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Kumpul Tugas</span>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-72 bg-slate-200/70 rounded-xl" />
              <div className="h-72 bg-slate-200/70 rounded-xl" />
            </div>
          </div>
        ) : (
          <>
            {/* Metric Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Program Bimbingan"
                value={approvedPendaftaran.length}
                subtitle={`${myPendaftaran.length} total pengajuan program`}
                icon={BookOpen}
                color="sky"
              />
              <StatCard
                title="Kelas Belajar"
                value={myKelas.length}
                subtitle="Kelas aktif yang diikuti"
                icon={GraduationCap}
                color="emerald"
              />
              <StatCard
                title="Tugas Menunggu"
                value={pendingTugas.length}
                subtitle={`${myPengumpulan.length} tugas telah dikumpulkan`}
                icon={FileText}
                color="amber"
              />
              <StatCard
                title="Rata-rata Nilai"
                value={averageScore !== null ? `${averageScore}` : "0"}
                subtitle={myPenilaian.length > 0 ? `Dari ${myPenilaian.length} tugas dinilai` : "Belum ada nilai"}
                icon={Award}
                color="purple"
                trend={averageScore !== null && averageScore >= 80 ? "Sangat Baik" : undefined}
              />
            </div>

            {/* Status Pengajuan & Tugas Mendatang */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Pengajuan Program */}
              <div className="bg-white rounded-3xl border border-slate-200/60 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Status Pengajuan Program</h2>
                      <p className="text-xs text-slate-500 mt-0.5">Pengajuan program bimbingan Anda</p>
                    </div>
                    <Link
                      href="/beranda/program"
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                    >
                      Lihat Semua
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {myPendaftaran.length === 0 ? (
                    <EmptyState
                      title="Belum Memilih Program"
                      description="Ajukan program bimbel untuk memulai penempatan kelas bimbingan."
                      actionLabel="Ajukan Program Sekarang"
                      actionHref="/beranda/program"
                    />
                  ) : (
                    <div className="space-y-3">
                      {myPendaftaran.slice(0, 3).map((item) => {
                        const prog = safeProgram.find((p) => p.id === item.programId);
                        return (
                          <div
                            key={item.id}
                            className="p-4 rounded-2xl border border-slate-200/60 bg-[#F2F2F7]/50 hover:bg-[#F2F2F7] transition-all flex items-center justify-between"
                          >
                            <div>
                              <div className="text-xs font-semibold text-slate-900">
                                {prog?.nama || "Program Bimbel"}
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                {prog?.durasi} &bull; {prog?.biaya}
                              </div>
                            </div>
                            <span
                              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                                item.status === "disetujui"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                                  : item.status === "ditolak"
                                  ? "bg-rose-50 text-rose-700 border-rose-200/60"
                                  : "bg-amber-50 text-amber-700 border-amber-200/60"
                              }`}
                            >
                              {item.status.toUpperCase()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Perlu bantuan pemilihan program?</span>
                  <Link href="/beranda/program" className="text-blue-600 font-semibold hover:underline">
                    Katalog Program
                  </Link>
                </div>
              </div>

              {/* Tugas Segera Dikumpulkan */}
              <div className="bg-white rounded-3xl border border-slate-200/60 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Tugas yang Perlu Dikerjakan</h2>
                      <p className="text-xs text-slate-500 mt-0.5">Penugasan aktif dari tutor</p>
                    </div>
                    <Link
                      href="/beranda/tugas"
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                    >
                      Buka Tugas
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {pendingTugas.length === 0 ? (
                    <EmptyState
                      title={myKelasIds.length === 0 ? "Belum Terdaftar di Kelas" : "Semua Tugas Telah Selesai"}
                      description={
                        myKelasIds.length === 0
                          ? "Anda belum ditempatkan di kelas bimbingan. Silakan ajukan program dan tunggu alokasi kelas oleh staf."
                          : "Tidak ada penugasan yang menunggu pengumpulan saat ini."
                      }
                      icon={myKelasIds.length === 0 ? BookOpen : CheckCircle2}
                      actionLabel={myKelasIds.length === 0 ? "Pilih Program Bimbel" : undefined}
                      actionHref={myKelasIds.length === 0 ? "/beranda/program" : undefined}
                    />
                  ) : (
                    <div className="space-y-3">
                      {pendingTugas.slice(0, 3).map((tg) => {
                        const kl = safeKelas.find((k) => k.id === tg.kelasId);
                        const formattedDate = formatDateOnly(tg.tenggatWaktu);

                        return (
                          <div
                            key={tg.id}
                            className="p-4 rounded-2xl border border-slate-200/60 bg-[#F2F2F7]/50 hover:bg-[#F2F2F7] transition-all flex items-center justify-between"
                          >
                            <div className="min-w-0 pr-3">
                              <div className="text-xs font-semibold text-slate-900 truncate">
                                {tg.judul}
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                                {kl?.nama || "Kelas Bimbingan"} &bull; Bobot: {tg.bobotNilai || 100} poin
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60">
                                Tenggat: {formattedDate}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Ingin melihat evaluasi & nilai?</span>
                  <Link href="/beranda/nilai" className="text-blue-600 font-semibold hover:underline">
                    Rangkuman Nilai
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
