"use client";

import React, { useState } from "react";
import Link from "next/link";
import DashboardLayout from "../../../components/DashboardLayout";
import StatCard from "../../../components/StatCard";
import EmptyState from "../../../components/EmptyState";
import { useData } from "../../../context/DataContext";
import { formatDateTime } from "../../../lib/dateUtils";
import {
  Award,
  CheckCircle2,
  FileText,
  MessageSquare,
  TrendingUp,
  User,
  ArrowRight,
  Clock,
  Eye,
  X,
  ExternalLink,
  AlignLeft,
  FileSpreadsheet,
  Printer,
  Download,
} from "lucide-react";

export default function NilaiSiswaPage() {
  const {
    isLoaded,
    currentUser,
    tugas = [],
    pengumpulan = [],
    penilaian = [],
    kelas = [],
    users = [],
  } = useData();

  const [selectedDetail, setSelectedDetail] = useState(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const safeTugas = Array.isArray(tugas) ? tugas : [];
  const safePengumpulan = Array.isArray(pengumpulan) ? pengumpulan : [];
  const safePenilaian = Array.isArray(penilaian) ? penilaian : [];
  const safeKelas = Array.isArray(kelas) ? kelas : [];
  const safeUsers = Array.isArray(users) ? users : [];

  // Pengumpulan tugas siswa aktif (Data Isolation: hanya milik siswa yang sedang login)
  const myPengumpulan = safePengumpulan.filter((p) => p.siswaId === currentUser?.id);

  // Pasangkan pengumpulan dengan nilai
  const gradedItems = myPengumpulan
    .map((submit) => {
      const tg = safeTugas.find((t) => t.id === submit.tugasId);
      const kl = safeKelas.find((k) => k.id === tg?.kelasId);
      const tutor = safeUsers.find((u) => u.id === kl?.tutorId);
      const grade = safePenilaian.find((pen) => pen.pengumpulanId === submit.id);

      return {
        submit,
        tugas: tg,
        kelas: kl,
        tutor,
        grade,
      };
    })
    .filter((item) => !!item.grade);

  const scores = gradedItems.map((item) => item.grade.nilai);
  const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;

  const getScoreBadge = (score) => {
    if (score >= 90) return { label: "Sangat Baik (A)", color: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20" };
    if (score >= 80) return { label: "Baik (B+)", color: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20" };
    if (score >= 70) return { label: "Cukup (B)", color: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20" };
    return { label: "Perlu Penguatan", color: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20" };
  };

  const isUrl = (text) => {
    if (!text) return false;
    const str = String(text).trim();
    return str.startsWith("http://") || str.startsWith("https://");
  };

  // Ekspor Transkrip ke Format Excel (.CSV UTF-8 BOM)
  const handleExportExcel = () => {
    if (gradedItems.length === 0) return;
    const headers = [
      "No",
      "Nama Tugas",
      "Kelas / Program",
      "Tutor Penilai",
      "Waktu Penilaian",
      "Skor Angka",
      "Predikat Mutu",
      "Catatan Evaluasi Edukatif",
    ];

    const rows = gradedItems.map((item, idx) => {
      const badge = getScoreBadge(item.grade.nilai);
      const formattedDate = formatDateTime(item.grade.tanggalNilai || item.submit.tanggalKumpul);
      return [
        idx + 1,
        `"${(item.tugas?.judul || "Tugas").replace(/"/g, '""')}"`,
        `"${(item.kelas?.nama || "-").replace(/"/g, '""')}"`,
        `"${(item.tutor?.nama || "Tutor").replace(/"/g, '""')}"`,
        `"${formattedDate}"`,
        item.grade.nilai,
        `"${badge.label}"`,
        `"${(item.grade.catatanTutor || "-").replace(/"/g, '""')}"`,
      ];
    });

    const csvContent =
      "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Transkrip_Nilai_${(currentUser?.nama || "Siswa").replace(/\s+/g, "_")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout
      title="Rangkuman Nilai & Umpan Balik Tutor"
      subtitle="Evaluasi hasil belajar, nilai angka tugas, dan catatan evaluasi edukatif langsung dari tutor bimbingan Anda."
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
            <div className="h-64 bg-slate-200/70 rounded-xl" />
          </div>
        ) : (
          <>
            {/* Metric Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Rata-rata Skor"
                value={scores.length > 0 ? `${averageScore}` : "0"}
                subtitle="Nilai rata-rata seluruh tugas"
                icon={Award}
                color="sky"
                trend={averageScore >= 80 ? "Sangat Baik" : undefined}
              />
              <StatCard
                title="Tugas Dinilai"
                value={gradedItems.length}
                subtitle={`Dari ${myPengumpulan.length} tugas dikumpulkan`}
                icon={FileText}
                color="emerald"
              />
              <StatCard
                title="Nilai Tertinggi"
                value={scores.length > 0 ? `${highestScore}` : "0"}
                subtitle="Pencapaian tugas terbaik"
                icon={TrendingUp}
                color="purple"
              />
              <StatCard
                title="Nilai Terendah"
                value={scores.length > 0 ? `${lowestScore}` : "0"}
                subtitle="Area materi perlu pendalaman"
                icon={CheckCircle2}
                color="amber"
              />
            </div>

            {/* Tabel Rekap Nilai & Feedback */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200/60 bg-white shadow-xs">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Daftar Tugas yang Telah Dinilai Tutor
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Data transparan hasil penilaian dan rekomendasi edukatif tutor pengampu.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-slate-700 bg-[#F2F2F7] px-3 py-1.5 rounded-full border border-slate-200/60">
                    {gradedItems.length} Tugas Dinilai
                  </span>
                  {gradedItems.length > 0 && (
                    <>
                      <button
                        onClick={handleExportExcel}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50/80 text-slate-700 font-semibold text-xs transition-all active:scale-95 duration-150 shadow-xs"
                        title="Ekspor rekapitulasi nilai ke format Excel (.CSV)"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Ekspor Excel</span>
                      </button>
                      <button
                        onClick={() => setIsPrintModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all active:scale-95 duration-150 shadow-xs"
                        title="Buka dan cetak transkrip nilai resmi (PDF)"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Unduh Transkrip (PDF)</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {gradedItems.length === 0 ? (
                <div className="p-8">
                  <EmptyState
                    title="Belum Ada Nilai Tugas"
                    description="Tugas yang telah Anda kumpulkan sedang dalam antrean pemeriksaan oleh tutor bimbingan."
                    icon={Award}
                  />
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/70 text-slate-500 uppercase text-[11px] font-semibold tracking-wider px-6 py-4 border-b border-slate-200/60">
                    <tr>
                      <th className="px-6 py-4">Tugas & Kelas</th>
                      <th className="px-6 py-4">Tutor Penilai</th>
                      <th className="px-6 py-4">Waktu Dinilai</th>
                      <th className="px-6 py-4">Skor Angka</th>
                      <th className="px-6 py-4">Catatan Evaluasi Edukatif</th>
                      <th className="px-6 py-4 text-right">Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {gradedItems.map((item) => {
                      const badge = getScoreBadge(item.grade.nilai);
                      const formattedDate = formatDateTime(item.grade.tanggalNilai || item.submit.tanggalKumpul);

                      return (
                        <tr key={item.grade.id || item.submit.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-semibold text-slate-900">{item.tugas?.judul || "Tugas"}</div>
                              <div className="text-[11px] text-slate-500 mt-0.5">{item.kelas?.nama}</div>
                            </td>

                            <td className="px-6 py-4">
                              <div className="font-medium text-slate-900">{item.tutor?.nama || "Tutor Bimbel"}</div>
                              <div className="text-[11px] text-slate-500 mt-0.5">{item.tutor?.email || "-"}</div>
                            </td>

                            <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                              {formattedDate}
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-slate-900 font-mono">
                                  {item.grade.nilai}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${badge.color}`}>
                                  {badge.label}
                                </span>
                              </div>
                            </td>

                            <td className="px-6 py-4 max-w-xs">
                              {item.grade.catatanTutor ? (
                                <p className="text-slate-700 italic bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 line-clamp-2">
                                  &ldquo;{item.grade.catatanTutor}&rdquo;
                                </p>
                              ) : (
                                <span className="text-slate-400 italic">Tidak ada catatan khusus</span>
                              )}
                            </td>

                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => setSelectedDetail(item)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                title="Lihat Evaluasi Lengkap"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal Detail Ulasan Nilai & Umpan Balik Lengkap */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-lg w-full p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block">
                  Detail Evaluasi Tugas
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {selectedDetail.tugas?.judul}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDetail(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-xs">
              <div className="flex items-center justify-between p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100">
                <div>
                  <span className="text-emerald-800 text-[11px] block">Nilai Diperoleh:</span>
                  <div className="text-2xl font-black text-emerald-950 font-mono">
                    {selectedDetail.grade.nilai} <span className="text-sm font-normal text-emerald-700">/ 100</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    {getScoreBadge(selectedDetail.grade.nilai).label}
                  </span>
                  <span className="text-[11px] text-emerald-700 block mt-1">
                    Oleh: {selectedDetail.tutor?.nama || "Tutor"}
                  </span>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Catatan Evaluasi Edukatif Tutor:
                </span>
                <div className="p-4 bg-[#F2F2F7]/50 rounded-2xl border border-slate-200/60 text-slate-800 italic leading-relaxed">
                  {selectedDetail.grade.catatanTutor || "Tidak ada catatan evaluasi tertulis dari tutor."}
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Jawaban yang Anda Kumpulkan:
                </span>
                {isUrl(selectedDetail.submit.jawaban) ? (
                  <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-100 flex items-center justify-between">
                    <span className="text-blue-900 truncate font-mono max-w-[280px]">
                      {selectedDetail.submit.jawaban}
                    </span>
                    <a
                      href={selectedDetail.submit.jawaban}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-semibold text-xs flex items-center gap-1.5 hover:bg-blue-700 shrink-0 shadow-xs active:scale-95 duration-150"
                    >
                      <span>Buka Dokumen</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  <div className="p-4 bg-[#F2F2F7]/40 rounded-2xl border border-slate-200/60 text-slate-800 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                    {selectedDetail.submit.jawaban}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 text-right">
                <button
                  onClick={() => setSelectedDetail(null)}
                  className="px-5 py-2.5 rounded-xl bg-[#F2F2F7] hover:bg-slate-200/80 text-slate-700 font-semibold text-xs transition-all active:scale-95 duration-150"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal & Print Sheet Dokumen Transkrip Akademik Resmi (PDF) */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          {/* Style khusus cetak agar output PDF bersih & profesional */}
          <style jsx global>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #printable-transcript,
              #printable-transcript * {
                visibility: visible;
              }
              #printable-transcript {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0;
                padding: 24px;
                background: white !important;
                color: black !important;
                box-shadow: none !important;
                border: none !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}</style>

          <div className="bg-white rounded-3xl border border-slate-100 max-w-3xl w-full p-6 sm:p-8 shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Action Bar (Hanya tampil di layar, tersembunyi saat cetak/PDF) */}
            <div className="no-print flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Pratinjau Dokumen Transkrip Nilai Siswa
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Siap dicetak atau disimpan dalam format PDF melalui browser.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / Simpan PDF</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Konten Kertas Transkrip Nilai Resmi */}
            <div
              id="printable-transcript"
              className="p-8 bg-white border border-slate-200/60 rounded-xl space-y-6 text-slate-900 font-sans"
            >
              {/* KOP Lembaga Pendidikan */}
              <div className="border-b-2 border-slate-800 pb-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    LJ
                  </div>
                  <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                    Portal Belajar Langkah Juara
                  </h1>
                </div>
                <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  Pusat Bimbingan Belajar & Pengembangan Potensi Akademik Terpadu
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Layanan Bimbingan SNBT, Kedinasan, & Mandiri | Surel: info@langkahjuara.sch.id
                </p>
              </div>

              {/* Judul Dokumen & Identitas Siswa */}
              <div className="text-center">
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 underline decoration-blue-500 underline-offset-4">
                  Transkrip Rekapitulasi Capaian Hasil Belajar Siswa
                </h2>
                <p className="text-[11px] text-slate-500 mt-1">
                  Nomor Referensi Dokumen: TR-{currentUser?.id ? currentUser.id.slice(0, 8).toUpperCase() : "LJ"}-{Date.now().toString().slice(-4)}
                </p>
              </div>

              {/* Tabel Biodata Siswa */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50/80 p-4 rounded-xl border border-slate-200/80">
                <div>
                  <div className="text-slate-500 text-[10px]">Nama Lengkap Siswa:</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">
                    {currentUser?.nama || "Siswa Bimbingan"}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px]">Alamat Surel (Akun):</div>
                  <div className="font-medium text-slate-800 mt-0.5">
                    {currentUser?.email || "-"}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px]">Status Keanggotaan:</div>
                  <div className="font-semibold text-emerald-700 mt-0.5">
                    Aktif Terverifikasi
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px]">Tanggal Dokumen Diterbitkan:</div>
                  <div className="font-medium text-slate-800 mt-0.5 font-mono">
                    {new Date().toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>

              {/* Ringkasan Performa Akademik */}
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-blue-50/70 border border-blue-200/60 rounded-lg">
                  <div className="text-[10px] text-blue-700 font-semibold uppercase">Rata-Rata Nilai</div>
                  <div className="text-xl font-black text-blue-950 font-mono mt-0.5">{averageScore}</div>
                </div>
                <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-lg">
                  <div className="text-[10px] text-emerald-700 font-semibold uppercase">Tugas Dinilai</div>
                  <div className="text-xl font-black text-emerald-950 font-mono mt-0.5">{gradedItems.length}</div>
                </div>
                <div className="p-3 bg-purple-50/70 border border-purple-200/60 rounded-lg">
                  <div className="text-[10px] text-purple-700 font-semibold uppercase">Nilai Tertinggi</div>
                  <div className="text-xl font-black text-purple-950 font-mono mt-0.5">{highestScore}</div>
                </div>
                <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-lg">
                  <div className="text-[10px] text-amber-700 font-semibold uppercase">Predikat Kelulusan</div>
                  <div className="text-xs font-bold text-amber-950 mt-1">{getScoreBadge(averageScore).label}</div>
                </div>
              </div>

              {/* Rincian Mata Uji & Nilai */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wide">
                  Rincian Penilaian Tugas & Evaluasi Tutor
                </h4>
                <table className="w-full text-left text-xs border border-slate-300">
                  <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-300">
                    <tr>
                      <th className="p-2 border-r border-slate-300 w-8 text-center">No</th>
                      <th className="p-2 border-r border-slate-300">Tugas & Rombel</th>
                      <th className="p-2 border-r border-slate-300">Tutor Pengampu</th>
                      <th className="p-2 border-r border-slate-300 w-16 text-center">Skor</th>
                      <th className="p-2 border-r border-slate-300 w-24 text-center">Predikat</th>
                      <th className="p-2">Ulasan Edukatif</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-[11px]">
                    {gradedItems.map((item, idx) => {
                      const badge = getScoreBadge(item.grade.nilai);
                      return (
                        <tr key={item.grade.id || idx}>
                          <td className="p-2 border-r border-slate-200 text-center font-mono">{idx + 1}</td>
                          <td className="p-2 border-r border-slate-200 font-semibold text-slate-900">
                            {item.tugas?.judul || "Tugas"}
                            <div className="text-[10px] text-slate-500 font-normal">{item.kelas?.nama}</div>
                          </td>
                          <td className="p-2 border-r border-slate-200 text-slate-700">
                            {item.tutor?.nama || "Tutor"}
                          </td>
                          <td className="p-2 border-r border-slate-200 text-center font-bold font-mono text-slate-900">
                            {item.grade.nilai}
                          </td>
                          <td className="p-2 border-r border-slate-200 text-center font-semibold text-[10px]">
                            {badge.label}
                          </td>
                          <td className="p-2 text-slate-600 italic">
                            {item.grade.catatanTutor || "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Tanda Tangan & Pengesahan */}
              <div className="pt-8 flex justify-between text-xs text-center">
                <div className="w-48">
                  <p className="text-slate-600">Mengetahui,</p>
                  <p className="font-semibold text-slate-800">Orang Tua / Wali Siswa</p>
                  <div className="h-16" />
                  <p className="border-t border-slate-400 pt-1 text-slate-700 font-medium">
                    ( ......................................... )
                  </p>
                </div>

                <div className="w-56">
                  <p className="text-slate-600">
                    Jakarta, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                  <p className="font-semibold text-slate-800">Bagian Akademik & Evaluasi</p>
                  <div className="h-16 flex items-center justify-center">
                    <span className="text-[10px] text-blue-600 uppercase font-bold tracking-widest border border-blue-400 px-2 py-0.5 rounded">
                      [ TERVERIFIKASI DIGITAL ]
                    </span>
                  </div>
                  <p className="border-t border-slate-400 pt-1 text-slate-700 font-bold">
                    Portal Belajar Langkah Juara
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer (No Print) */}
            <div className="no-print pt-4 mt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Tutup
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Unduh PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
