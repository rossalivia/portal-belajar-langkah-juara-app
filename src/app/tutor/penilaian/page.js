"use client";

import React, { useState } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import EmptyState from "../../../components/EmptyState";
import { useData } from "../../../context/DataContext";
import { formatDateTime } from "../../../lib/dateUtils";
import {
  CheckSquare,
  Award,
  CheckCircle2,
  Clock,
  Send,
  X,
  Search,
  Loader2,
  ExternalLink,
  AlignLeft,
  Sparkles,
  FileSpreadsheet,
} from "lucide-react";

export default function PenilaianTutorPage() {
  const {
    isLoaded,
    currentUser,
    pengumpulan = [],
    tugas = [],
    users = [],
    penilaian = [],
    kelas = [],
    gradeTugas,
  } = useData();

  const isSuperAdmin = currentUser?.role === "super_admin";
  const safePengumpulan = Array.isArray(pengumpulan) ? pengumpulan : [];
  const safeTugas = Array.isArray(tugas) ? tugas : [];
  const safeUsers = Array.isArray(users) ? users : [];
  const safePenilaian = Array.isArray(penilaian) ? penilaian : [];
  const safeKelas = Array.isArray(kelas) ? kelas : [];
  const myKelasIds = isSuperAdmin
    ? safeKelas.map((k) => k.id)
    : safeKelas.filter((k) => k.tutorId === currentUser?.id).map((k) => k.id);

  const [filterType, setFilterType] = useState("belum"); // "belum" | "sudah" | "semua"
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [nilaiInput, setNilaiInput] = useState("");
  const [catatanInput, setCatatanInput] = useState("");
  const [gradeError, setGradeError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pasangkan pengumpulan dengan data relasinya (hanya untuk kelas yang diampu tutor aktif)
  const submissionItems = safePengumpulan
    .map((sub) => {
      const tg = safeTugas.find((t) => t.id === sub.tugasId);
      const siswa = safeUsers.find((u) => u.id === sub.siswaId);
      const kl = safeKelas.find((k) => k.id === tg?.kelasId);
      const existingGrade = safePenilaian.find((pen) => pen.pengumpulanId === sub.id);

      return {
        sub,
        tugas: tg,
        siswa,
        kelas: kl,
        grade: existingGrade,
      };
    })
    .filter((item) => isSuperAdmin || (item.kelas?.id && myKelasIds.includes(item.kelas.id)));

  const filteredItems = submissionItems.filter((item) => {
    if (filterType === "belum") return !item.grade;
    if (filterType === "sudah") return !!item.grade;
    return true;
  });

  const handleOpenGradeModal = (item) => {
    setSelectedSubmission(item);
    setNilaiInput(item.grade ? item.grade.nilai.toString() : "");
    setCatatanInput(item.grade ? item.grade.catatanTutor : "");
    setGradeError("");
    setIsModalOpen(true);
  };

  const handleApplyPresetNote = (note) => {
    setCatatanInput((prev) => {
      if (!prev) return note;
      return `${prev} ${note}`;
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    const num = Number(nilaiInput);
    if (nilaiInput === "" || isNaN(num) || num < 0 || num > 100) {
      setGradeError("Nilai wajib berupa angka antara 0 sampai 100.");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await gradeTugas(selectedSubmission.sub.id, num, catatanInput);
      if (success) {
        setIsModalOpen(false);
        setGradeError("");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAnswerUrl = (jawaban) => {
    if (!jawaban) return false;
    const str = String(jawaban).trim();
    return str.startsWith("http://") || str.startsWith("https://");
  };

  const handleExportExcel = () => {
    if (submissionItems.length === 0) return;
    const headers = [
      "No",
      "Nama Siswa",
      "Email Siswa",
      "Judul Tugas",
      "Rombel Kelas",
      "Tanggal Pengumpulan",
      "Status Penilaian",
      "Nilai",
      "Catatan Tutor",
    ];

    const rows = submissionItems.map((item, idx) => {
      const isGraded = !!item.grade;
      const formattedDate = formatDateTime(item.sub.tanggalKumpul);
      return [
        idx + 1,
        `"${(item.siswa?.nama || "Siswa").replace(/"/g, '""')}"`,
        `"${(item.siswa?.email || "-").replace(/"/g, '""')}"`,
        `"${(item.tugas?.judul || "Tugas").replace(/"/g, '""')}"`,
        `"${(item.kelas?.nama || "-").replace(/"/g, '""')}"`,
        `"${formattedDate}"`,
        `"${isGraded ? "Sudah Dinilai" : "Menunggu Dinilai"}"`,
        isGraded ? item.grade.nilai : "-",
        `"${(item.grade?.catatanTutor || "-").replace(/"/g, '""')}"`,
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
      `Rekap_Nilai_Tutor_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout
      title="Penilaian & Evaluasi Tugas Siswa"
      subtitle="Antarmuka grading: Berikan skor objektif (0–100) dan catatan evaluasi edukatif langsung tersimpan ke Cloud Firestore."
    >
      <div className="space-y-6">
        {!isLoaded ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-16 bg-slate-200/70 rounded-xl" />
            <div className="h-64 bg-slate-200/70 rounded-xl" />
          </div>
        ) : (
          <>
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status Penilaian
                </span>
                {submissionItems.length > 0 && (
                  <button
                    onClick={handleExportExcel}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shadow-xs ml-2"
                    title="Ekspor seluruh rekap penilaian kelas ke format Excel (.CSV)"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Ekspor Excel</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 p-1 bg-[#F2F2F7]/80 rounded-2xl border border-slate-200/60">
                <button
                  onClick={() => setFilterType("belum")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 active:scale-95 duration-150 ${
                    filterType === "belum"
                      ? "bg-white text-rose-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Belum Dinilai ({submissionItems.filter((i) => !i.grade).length})
                </button>
                <button
                  onClick={() => setFilterType("sudah")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 active:scale-95 duration-150 ${
                    filterType === "sudah"
                      ? "bg-white text-emerald-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Sudah Dinilai ({submissionItems.filter((i) => !!i.grade).length})
                </button>
                <button
                  onClick={() => setFilterType("semua")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 active:scale-95 duration-150 ${
                    filterType === "semua"
                      ? "bg-white text-blue-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Semua ({submissionItems.length})
                </button>
              </div>
            </div>

            {/* Tabel Pengumpulan Tugas */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200/60 bg-white shadow-xs">
              {filteredItems.length === 0 ? (
                <div className="p-8">
                  <EmptyState
                    title="Tidak Ada Jawaban Tugas"
                    description={
                      filterType === "belum"
                        ? "Seluruh jawaban tugas yang masuk dari kelas yang Anda ampu telah selesai dinilai."
                        : "Belum ada pengumpulan tugas dari siswa yang sesuai filter."
                    }
                    icon={CheckSquare}
                  />
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/70 text-slate-500 uppercase text-[11px] font-semibold tracking-wider px-6 py-4 border-b border-slate-200/60">
                    <tr>
                      <th className="px-6 py-4">Nama Siswa</th>
                      <th className="px-6 py-4">Judul Tugas & Kelas</th>
                        <th className="px-6 py-4">Tipe Jawaban</th>
                        <th className="px-6 py-4">Waktu Dikumpulkan</th>
                        <th className="px-6 py-4">Skor Nilai</th>
                        <th className="px-6 py-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredItems.map((item) => {
                        const formattedDate = formatDateTime(item.sub.tanggalKumpul);
                        const isUrl = isAnswerUrl(item.sub.jawaban);

                        return (
                          <tr key={item.sub.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-semibold text-slate-900">{item.siswa?.nama || "Siswa"}</div>
                              <div className="text-[11px] text-slate-500 mt-0.5">{item.siswa?.email || "-"}</div>
                            </td>

                            <td className="px-6 py-4">
                              <div className="font-medium text-slate-900">{item.tugas?.judul || "Tugas"}</div>
                              <div className="text-[11px] text-slate-500 mt-0.5">{item.kelas?.nama}</div>
                            </td>

                            <td className="px-6 py-4">
                              {isUrl ? (
                                <a
                                  href={item.sub.jawaban}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 ring-1 ring-inset ring-blue-600/20 transition-colors"
                                >
                                  <span>Buka Tautan</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                                  <AlignLeft className="w-3 h-3 text-slate-400" />
                                  <span>Teks Tertulis</span>
                                </span>
                              )}
                            </td>

                            <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                              {formattedDate}
                            </td>

                            <td className="px-6 py-4">
                              {item.grade ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                  <Award className="w-3.5 h-3.5" />
                                  {item.grade.nilai}/100
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20">
                                  <Clock className="w-3.5 h-3.5" />
                                  Menunggu
                                </span>
                              )}
                            </td>

                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleOpenGradeModal(item)}
                                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-sm transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                {item.grade ? "Edit Nilai" : "Beri Nilai"}
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

      {/* Modal Grading & Evaluasi Edukatif */}
      {isModalOpen && selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-lg w-full p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block">
                  Lembar Penilaian & Evaluasi
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {selectedSubmission.siswa?.nama} &bull; {selectedSubmission.kelas?.nama}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-5 space-y-4">
              <div className="p-4 bg-[#F2F2F7]/60 rounded-2xl border border-slate-200/60 text-xs">
                <div className="font-bold text-slate-900">{selectedSubmission.tugas?.judul}</div>
                <div className="text-slate-500 mt-1">Bobot Soal: {selectedSubmission.tugas?.bobotNilai || 100} Poin</div>
              </div>

              <div>
                <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Jawaban yang Dikumpulkan Siswa:
                </span>
                {isAnswerUrl(selectedSubmission.sub?.jawaban) ? (
                  <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-100 flex items-center justify-between text-xs">
                    <span className="text-blue-900 truncate font-mono max-w-[280px]">
                      {selectedSubmission.sub?.jawaban}
                    </span>
                    <a
                      href={selectedSubmission.sub?.jawaban}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-semibold text-xs flex items-center gap-1.5 hover:bg-blue-700 shrink-0 shadow-xs active:scale-95 duration-150"
                    >
                      <span>Buka Dokumen</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  <div className="p-4 bg-[#F2F2F7]/40 rounded-2xl border border-slate-200/60 text-xs text-slate-800 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap">
                    {selectedSubmission.sub?.jawaban || "Tidak ada jawaban tertulis."}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Skor Nilai Angka (0 - 100) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={nilaiInput}
                  onChange={(e) => {
                    setNilaiInput(e.target.value);
                    if (gradeError) setGradeError("");
                  }}
                  required
                  placeholder="Masukkan angka 0 - 100"
                  className="w-full px-4 py-3 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/60 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-semibold"
                />
                {gradeError && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{gradeError}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Catatan & Umpan Balik Edukatif
                  </label>
                  <span className="text-[11px] text-slate-400">Pemberian feedback belajar</span>
                </div>
                <textarea
                  rows={3}
                  value={catatanInput}
                  onChange={(e) => setCatatanInput(e.target.value)}
                  placeholder="Tuliskan evaluasi konstruktif, penguatan konsep, atau tips pengerjaan soal..."
                  className="w-full p-3.5 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/60 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all leading-relaxed"
                />

                {/* Preset Chips */}
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleApplyPresetNote("Pemahaman konsep sangat baik dan metodologi tepat!")}
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#F2F2F7] hover:bg-slate-200/80 text-slate-700 transition-all active:scale-95 duration-150"
                  >
                    + Konsep Sangat Baik
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetNote("Perlu ketelitian lebih pada langkah penyelesaian akhir.")}
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#F2F2F7] hover:bg-slate-200/80 text-slate-700 transition-all active:scale-95 duration-150"
                  >
                    + Tingkatkan Ketelitian
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetNote("Tingkatkan penalaran analitis dan latihan variasi soal.")}
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#F2F2F7] hover:bg-slate-200/80 text-slate-700 transition-all active:scale-95 duration-150"
                  >
                    + Perbanyak Latihan
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100/80 transition-all active:scale-95 duration-150"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all active:scale-95 duration-150 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan Nilai...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Simpan Penilaian</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
