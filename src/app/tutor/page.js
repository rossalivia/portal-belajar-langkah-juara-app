"use client";

import React, { useState } from "react";
import Link from "next/link";
import DashboardLayout from "../../components/DashboardLayout";
import StatCard from "../../components/StatCard";
import EmptyState from "../../components/EmptyState";
import { useData } from "../../context/DataContext";
import {
  Users,
  PenTool,
  CheckSquare,
  Award,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  BarChart3,
  TrendingUp,
  AlertCircle,
  Percent,
} from "lucide-react";

export default function DasborTutorPage() {
  const { isLoaded, currentUser, kelas = [], tugas = [], pengumpulan = [], penilaian = [], users = [] } = useData();

  const safeKelas = Array.isArray(kelas) ? kelas : [];
  const safeTugas = Array.isArray(tugas) ? tugas : [];
  const safePengumpulan = Array.isArray(pengumpulan) ? pengumpulan : [];
  const safePenilaian = Array.isArray(penilaian) ? penilaian : [];
  const safeUsers = Array.isArray(users) ? users : [];

  // Kelas yang diampu oleh tutor ini (atau seluruh kelas untuk Super Admin)
  const isSuperAdmin = currentUser?.role === "super_admin";
  const myKelas = isSuperAdmin ? safeKelas : safeKelas.filter((k) => k.tutorId === currentUser?.id);
  const activeKelas = myKelas;
  const activeKelasIds = activeKelas.map((k) => k.id);

  // Total siswa unik dalam kelas tutor
  const totalStudents = [...new Set(activeKelas.flatMap((k) => k?.siswaIds || []))].length;

  // Tugas yang dibuat untuk kelas tutor
  const myTugas = safeTugas.filter((t) => activeKelasIds.includes(t.kelasId));
  const myTugasIds = myTugas.map((t) => t.id);

  // Pengumpulan jawaban oleh siswa
  const myPengumpulan = safePengumpulan.filter((p) => myTugasIds.includes(p.tugasId));

  // Pengumpulan yang sudah dinilai vs belum dinilai
  const gradedSubmissionIds = new Set(safePenilaian.map((pen) => pen.pengumpulanId));
  const pendingGradingSubmissions = myPengumpulan.filter(
    (p) => !gradedSubmissionIds.has(p.id)
  );

  // ==========================================
  // KALKULASI ANALITIK SESUAI PRD BAB 3 & 4.4
  // ==========================================
  
  // Analisis Partisipasi per Tugas
  const taskAnalytics = myTugas.map((t) => {
    const targetKelas = safeKelas.find((k) => k.id === t.kelasId);
    const totalSiswaInClass = targetKelas?.siswaIds?.length || 0;
    const submissionsForTask = myPengumpulan.filter((p) => p.tugasId === t.id);
    const submittedCount = submissionsForTask.length;
    const rate = totalSiswaInClass > 0 ? Math.min(100, Math.round((submittedCount / totalSiswaInClass) * 100)) : 0;

    // Nilai tugas
    const gradesForTask = safePenilaian.filter((pn) =>
      submissionsForTask.some((s) => s.id === pn.pengumpulanId)
    );
    const avgScore =
      gradesForTask.length > 0
        ? Math.round(gradesForTask.reduce((sum, g) => sum + (Number(g.nilai) || 0), 0) / gradesForTask.length)
        : null;

    const isOverdue = t.tenggatWaktu ? new Date() > new Date(t.tenggatWaktu) : false;

    return {
      tugas: t,
      kelas: targetKelas,
      totalSiswa: totalSiswaInClass,
      submittedCount,
      rate,
      avgScore,
      isOverdue,
      evaluatedCount: gradesForTask.length,
    };
  });

  // Kalkulasi Agregat Partisipasi & Nilai
  const totalExpectedSubmissions = taskAnalytics.reduce((sum, item) => sum + item.totalSiswa, 0);
  const overallParticipationRate =
    totalExpectedSubmissions > 0
      ? Math.min(100, Math.round((myPengumpulan.length / totalExpectedSubmissions) * 100))
      : 0;

  const allTutorGrades = safePenilaian.filter((pn) =>
    myPengumpulan.some((p) => p.id === pn.pengumpulanId)
  );
  const allScores = allTutorGrades
    .map((g) => Number(g.nilai))
    .filter((n) => !isNaN(n));

  const overallAvgScore =
    allScores.length > 0
      ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
      : 0;

  // Distribusi Skor (Grade A, B, C/D)
  const gradeA = allScores.filter((s) => s >= 85).length;
  const gradeB = allScores.filter((s) => s >= 70 && s < 85).length;
  const gradeCD = allScores.filter((s) => s < 70).length;
  const totalGraded = allScores.length;

  return (
    <DashboardLayout
      title={`Dasbor Tutor: ${currentUser?.nama || "Tutor"}`}
      subtitle="Ruang kerja pengajar: Kelola tugas, pantau grafik partisipasi pengumpulan, dan evaluasi hasil belajar siswa."
      action={
        <div className="flex items-center gap-2">
          <Link
            href="/tutor/tugas"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs active:scale-95 duration-150 transition-all flex items-center gap-2"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Buat Tugas Baru</span>
          </Link>
          <Link
            href="/tutor/penilaian"
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-xs active:scale-95 duration-150 transition-all flex items-center gap-2"
          >
            <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
            <span>Grading ({pendingGradingSubmissions.length})</span>
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
              <div className="h-64 bg-slate-200/70 rounded-xl" />
              <div className="h-64 bg-slate-200/70 rounded-xl" />
            </div>
          </div>
        ) : (
          <>
            {/* Metrik Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Kelas Diampu"
                value={activeKelas.length}
                subtitle={`${activeKelas.map((k) => k.nama).join(", ") || "Tidak ada kelas"}`}
                icon={BookOpen}
                color="sky"
              />
          <StatCard
            title="Total Siswa Aktif"
            value={totalStudents}
            subtitle="Siswa di seluruh kelas Anda"
            icon={Users}
            color="emerald"
          />
          <StatCard
            title="Partisipasi Pengumpulan"
            value={`${overallParticipationRate}%`}
            subtitle={`${myPengumpulan.length} dari ${totalExpectedSubmissions} total target`}
            icon={Percent}
            color="purple"
            trend={overallParticipationRate >= 75 ? "Sangat Aktif" : undefined}
          />
          <StatCard
            title="Perlu Dinilai"
            value={pendingGradingSubmissions.length}
            subtitle={`Rata-rata kelas: ${overallAvgScore > 0 ? overallAvgScore + "/100" : "Belum ada nilai"}`}
            icon={CheckSquare}
            color="rose"
            trend={pendingGradingSubmissions.length > 0 ? "Perlu Diperiksa" : undefined}
          />
        </div>

        {/* SECTION: VISUALISASI GRAFIK ANALITIK (PRD BAB 3 & BAB 4.4) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* 1. Grafik Tingkat Partisipasi Pengumpulan Tugas */}
          <div className="bg-white rounded-3xl border border-slate-200/60 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 mb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    <h2 className="text-base font-bold text-slate-900">
                      Tingkat Partisipasi Pengumpulan Tugas
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Rasio siswa yang telah mengumpulkan tugas di tiap kelas (PRD Bab 4.4).
                  </p>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                  {taskAnalytics.length} Tugas
                </span>
              </div>

              {taskAnalytics.length === 0 ? (
                <div className="py-8">
                  <EmptyState
                    title="Belum Ada Penugasan"
                    description="Buat tugas baru untuk melihat visualisasi partisipasi pengumpulan siswa."
                    actionLabel="Buat Tugas"
                    onAction={() => (window.location.href = "/tutor/tugas")}
                    icon={PenTool}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {taskAnalytics.slice(0, 5).map((item) => {
                    const isHigh = item.rate >= 75;
                    const isMedium = item.rate >= 50 && item.rate < 75;

                    return (
                      <div key={item.tugas.id} className="p-4 rounded-2xl border border-slate-200/60 bg-[#F2F2F7]/40 hover:bg-[#F2F2F7]/70 transition-colors">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-slate-900 truncate">
                              {item.tugas.judul}
                            </h4>
                            <span className="text-[11px] text-slate-500">
                              {item.kelas?.nama || "Kelas"} • Tenggat:{" "}
                              {new Date(item.tugas.tenggatWaktu).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          </div>

                          <div className="text-right shrink-0">
                            <span
                              className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                                isHigh
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                                  : isMedium
                                  ? "bg-amber-50 text-amber-700 border-amber-200/60"
                                  : "bg-rose-50 text-rose-700 border-rose-200/60"
                              }`}
                            >
                              {item.rate}% ({item.submittedCount}/{item.totalSiswa})
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar Partisipasi */}
                        <div className="w-full bg-slate-200/70 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              isHigh ? "bg-emerald-500" : isMedium ? "bg-amber-500" : "bg-rose-500"
                            }`}
                            style={{ width: `${item.rate}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Tinggi</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Sedang</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Rendah</span>
                </span>
              </div>
              <Link href="/tutor/tugas" className="text-blue-600 font-semibold hover:text-blue-700">
                Kelola Tugas &rarr;
              </Link>
            </div>
          </div>

          {/* 2. Visualisasi Rata-Rata Nilai & Distribusi Skor (PRD Bab 3) */}
          {/* 2. Visualisasi Rata-Rata Nilai & Distribusi Skor (PRD Bab 3) */}
          <div className="bg-white rounded-3xl border border-slate-200/60 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 mb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    <h2 className="text-base font-bold text-slate-900">
                      Rata-Rata Nilai & Sebaran Skor
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Evaluasi performa akademik siswa yang telah dinilai tutor (PRD Bab 3).
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[10px] font-medium">Rata-rata Total</span>
                  <span className="text-base font-extrabold text-purple-700">
                    {overallAvgScore > 0 ? `${overallAvgScore}/100` : "-"}
                  </span>
                </div>
              </div>

              {totalGraded === 0 ? (
                <div className="py-8">
                  <EmptyState
                    title="Belum Ada Nilai Diberikan"
                    description="Nilai tugas siswa yang telah dikumpulkan untuk melihat grafik distribusi skor."
                    actionLabel="Buka Lembar Penilaian"
                    onAction={() => (window.location.href = "/tutor/penilaian")}
                    icon={Award}
                  />
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Histogram Distribusi Grade */}
                  <div>
                    <span className="text-xs font-bold text-slate-700 block mb-3">
                      Sebaran Predikat Nilai ({totalGraded} Pengumpulan Dinilai):
                    </span>

                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/60">
                        <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                          Predikat A (&ge; 85)
                        </span>
                        <div className="text-xl font-bold text-emerald-900 mt-1">{gradeA}</div>
                        <span className="text-[10px] text-emerald-700 font-semibold">
                          {Math.round((gradeA / totalGraded) * 100)}% siswa
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/60">
                        <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
                          Predikat B (70-84)
                        </span>
                        <div className="text-xl font-bold text-blue-900 mt-1">{gradeB}</div>
                        <span className="text-[10px] text-blue-700 font-semibold">
                          {Math.round((gradeB / totalGraded) * 100)}% siswa
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/60">
                        <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">
                          Remedial (&lt; 70)
                        </span>
                        <div className="text-xl font-bold text-rose-900 mt-1">{gradeCD}</div>
                        <span className="text-[10px] text-rose-700 font-semibold">
                          {Math.round((gradeCD / totalGraded) * 100)}% siswa
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Grafik Batang Nilai Rata-rata per Tugas */}
                  <div>
                    <span className="text-xs font-bold text-slate-700 block mb-2">
                      Rata-Rata Skor per Tugas:
                    </span>
                    <div className="space-y-2.5">
                      {taskAnalytics.filter((t) => t.avgScore !== null).slice(0, 4).map((t) => (
                        <div key={t.tugas.id} className="flex items-center gap-3 text-xs">
                          <span className="w-32 truncate font-semibold text-slate-700">
                            {t.tugas.judul}
                          </span>
                          <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                            <div
                              className="h-3 rounded-full bg-purple-600 transition-all duration-500"
                              style={{ width: `${t.avgScore}%` }}
                            />
                          </div>
                          <span className="w-12 text-right font-bold text-slate-900">
                            {t.avgScore}/100
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
              <span>{pendingGradingSubmissions.length} pengumpulan menunggu evaluasi Anda.</span>
              <Link href="/tutor/penilaian" className="text-blue-600 font-semibold hover:text-blue-700">
                Beri Penilaian &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Tabel Pengumpulan Tugas yang Menunggu Penilaian */}
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xs overflow-hidden">
          <div className="p-6 sm:p-7 border-b border-slate-200/60 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">
                Pengumpulan Tugas Siswa yang Menunggu Penilaian
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Segera beri penilaian dan catatan konstruktif kepada siswa.
              </p>
            </div>
            <Link
              href="/tutor/penilaian"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors"
            >
              Lihat Semua
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {pendingGradingSubmissions.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="Semua Pengumpulan Telah Dinilai"
                description="Tidak ada jawaban tugas siswa yang menunggu penilaian saat ini."
                icon={CheckCircle2}
              />
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border-x-0 border-t-0 border-slate-200/60">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 border-b border-slate-200/60 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Nama Siswa</th>
                    <th className="px-6 py-4">Tugas & Kelas</th>
                    <th className="px-6 py-4">Tanggal Kumpul</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingGradingSubmissions.slice(0, 5).map((sub) => {
                    const siswa = safeUsers.find((u) => u.id === sub.siswaId);
                    const tg = safeTugas.find((t) => t.id === sub.tugasId);
                    const kl = safeKelas.find((k) => k.id === tg?.kelasId);
                    const formattedDate = new Date(sub.tanggalKumpul).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{siswa?.nama || "Siswa"}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{siswa?.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{tg?.judul || "Tugas"}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{kl?.nama}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                          {formattedDate}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href="/tutor/penilaian"
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs active:scale-95 duration-150 transition-all inline-block"
                          >
                            Beri Nilai
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        </>
        )}
      </div>
    </DashboardLayout>
  );
}
