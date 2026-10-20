"use client";

import React, { useState } from "react";
import Link from "next/link";
import DashboardLayout from "../../../components/DashboardLayout";
import EmptyState from "../../../components/EmptyState";
import RichTextRenderer from "../../../components/RichTextRenderer";
import { useData } from "../../../context/DataContext";
import { formatDateTime, isPastDate } from "../../../lib/dateUtils";
import {
  FileText,
  CheckCircle2,
  Clock,
  Send,
  Calendar,
  X,
  Loader2,
  AlertCircle,
  ExternalLink,
  Link as LinkIcon,
  PenTool,
  AlignLeft,
  Info,
} from "lucide-react";

export default function TugasSiswaPage() {
  const {
    isLoaded,
    currentUser,
    kelas = [],
    tugas = [],
    pengumpulan = [],
    penilaian = [],
    submitTugas,
  } = useData();

  const [filterStatus, setFilterStatus] = useState("semua"); // "semua" | "belum" | "dikumpulkan" | "dinilai" | "terlambat"
  const [selectedTugas, setSelectedTugas] = useState(null);
  const [tipeJawaban, setTipeJawaban] = useState("teks"); // "teks" | "tautan"
  const [jawabanInput, setJawabanInput] = useState("");
  const [inputError, setInputError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const safeKelas = Array.isArray(kelas) ? kelas : [];
  const safeTugas = Array.isArray(tugas) ? tugas : [];
  const safePengumpulan = Array.isArray(pengumpulan) ? pengumpulan : [];
  const safePenilaian = Array.isArray(penilaian) ? penilaian : [];

  // Kelas yang diikuti siswa aktif
  const myKelas = safeKelas.filter((k) => k?.siswaIds?.includes(currentUser?.id));
  const myKelasIds = myKelas.map((k) => k.id);

  // Tugas untuk kelas yang diikuti siswa aktif (isolasi data)
  const myTugas =
    myKelasIds.length > 0
      ? safeTugas.filter((t) => myKelasIds.includes(t.kelasId))
      : [];

  // Pengumpulan tugas siswa aktif
  const myPengumpulan = safePengumpulan.filter((p) => p.siswaId === currentUser?.id);

  // Fungsi kalkulasi status tugas
  const getTugasStatus = (tg) => {
    const submission = myPengumpulan.find((p) => p.tugasId === tg.id);
    const grade = submission
      ? safePenilaian.find((pn) => pn.pengumpulanId === submission.id)
      : null;
    const isGraded = !!grade || (submission && submission.nilai != null);

    if (isGraded) {
      return {
        key: "dinilai",
        label: "Dinilai",
        color: "#15A66A",
        bgClass: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
        submission,
        grade,
      };
    }

    if (submission) {
      return {
        key: "dikumpulkan",
        label: "Dikumpulkan",
        color: "#F59E0B",
        bgClass: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
        submission,
        grade: null,
      };
    }

    const isOverdue = isPastDate(tg.tenggatWaktu);
    if (isOverdue) {
      return {
        key: "terlambat",
        label: "Terlambat",
        color: "#E53935",
        bgClass: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20",
        submission: null,
        grade: null,
      };
    }

    return {
      key: "belum",
      label: "Belum dikumpulkan",
      color: "#6B7280",
      bgClass: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-300",
      submission: null,
      grade: null,
    };
  };

  const filteredTugas = myTugas.filter((t) => {
    const statusInfo = getTugasStatus(t);
    if (filterStatus === "semua") return true;
    return statusInfo.key === filterStatus;
  });

  const handleOpenSubmitModal = (tg) => {
    setSelectedTugas(tg);
    const submission = myPengumpulan.find((p) => p.tugasId === tg.id);
    const currentJawaban = submission ? submission.jawaban : "";
    setJawabanInput(currentJawaban);

    if (currentJawaban.startsWith("http://") || currentJawaban.startsWith("https://")) {
      setTipeJawaban("tautan");
    } else {
      setTipeJawaban("teks");
    }

    setInputError("");
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTugas) return;

    const trimmedJawaban = jawabanInput.trim();
    if (!trimmedJawaban) {
      setInputError(
        tipeJawaban === "tautan"
          ? "Tautan dokumen jawaban wajib diisi."
          : "Teks jawaban tugas wajib diisi."
      );
      return;
    }

    if (tipeJawaban === "tautan" && !trimmedJawaban.startsWith("http://") && !trimmedJawaban.startsWith("https://")) {
      setInputError("Tautan dokumen wajib diawali dengan https:// atau http:// (contoh: Google Drive, Docs, dsb.)");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await submitTugas(selectedTugas.id, trimmedJawaban);
      if (success) {
        setIsModalOpen(false);
        setInputError("");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title="Daftar & Pengumpulan Tugas"
      subtitle="Kerjakan latihan soal dan kumpulkan jawaban teks atau tautan dokumen ke tutor rombongan belajar Anda."
    >
      <div className="space-y-6">
        {!isLoaded ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-16 bg-slate-200/70 rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-56 bg-slate-200/70 rounded-xl" />
              <div className="h-56 bg-slate-200/70 rounded-xl" />
            </div>
          </div>
        ) : (
          <>
            {/* Filter Bar Status Dinamis */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Filter Status Tugas
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F2F2F7]/80 rounded-2xl border border-slate-200/60">
                <button
                  onClick={() => setFilterStatus("semua")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 duration-150 ${
                    filterStatus === "semua"
                      ? "bg-white text-blue-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Semua ({myTugas.length})
                </button>
                <button
                  onClick={() => setFilterStatus("belum")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 duration-150 ${
                    filterStatus === "belum"
                      ? "bg-white text-slate-800 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Belum ({myTugas.filter((t) => getTugasStatus(t).key === "belum").length})
                </button>
                <button
                  onClick={() => setFilterStatus("dikumpulkan")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 duration-150 ${
                    filterStatus === "dikumpulkan"
                      ? "bg-white text-amber-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Dikumpulkan ({myTugas.filter((t) => getTugasStatus(t).key === "dikumpulkan").length})
                </button>
                <button
                  onClick={() => setFilterStatus("dinilai")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 duration-150 ${
                    filterStatus === "dinilai"
                      ? "bg-white text-emerald-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Dinilai ({myTugas.filter((t) => getTugasStatus(t).key === "dinilai").length})
                </button>
                <button
                  onClick={() => setFilterStatus("terlambat")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 duration-150 ${
                    filterStatus === "terlambat"
                      ? "bg-white text-rose-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Terlambat ({myTugas.filter((t) => getTugasStatus(t).key === "terlambat").length})
                </button>
              </div>
            </div>

            {/* Jika siswa belum ditempatkan ke kelas mana pun */}
            {myKelas.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-xs text-center">
                <EmptyState
                  title="Anda Belum Terdaftar di Rombongan Belajar"
                  description="Pengajuan program Anda sedang diverifikasi atau belum dialokasikan ke kelas bimbingan oleh staf admisi. Silakan cek menu Pengajuan Program."
                  icon={Clock}
                />
              </div>
            ) : filteredTugas.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200/80 p-8 shadow-sm text-center">
                <EmptyState
                  title="Tidak Ada Tugas"
                  description={
                    filterStatus === "semua"
                      ? "Tutor belum menerbitkan tugas baru untuk kelas bimbingan Anda."
                      : `Tidak ada tugas dengan filter status "${filterStatus}".`
                  }
                  icon={FileText}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredTugas.map((tg) => {
                  const statusInfo = getTugasStatus(tg);
                  const targetKelas = myKelas.find((k) => k.id === tg.kelasId);
                  const formattedDeadline = formatDateTime(tg.tenggatWaktu);

                  return (
                    <div
                      key={tg.id}
                      className="bg-white rounded-3xl border border-slate-200/60 p-6 sm:p-7 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3.5">
                          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                            {targetKelas?.nama || "Kelas Bimbingan"}
                          </span>
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusInfo.bgClass}`}>
                            {statusInfo.label}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 leading-snug">{tg.judul}</h3>

                        {/* Cuplikan Deskripsi Tugas */}
                        <div className="mt-3 p-3.5 rounded-2xl bg-[#F2F2F7]/50 border border-slate-200/60 max-h-32 overflow-hidden text-xs text-slate-600 leading-relaxed">
                          <RichTextRenderer content={tg.deskripsi} />
                        </div>

                        {/* Catatan Feedback jika sudah dinilai */}
                        {statusInfo.grade && (
                          <div className="mt-3 p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs">
                            <div className="flex items-center justify-between font-bold text-emerald-900">
                              <span>Nilai: {statusInfo.grade.nilai}/100</span>
                              <span className="text-[11px] font-normal text-emerald-700">Telah Dinilai Tutor</span>
                            </div>
                            {statusInfo.grade.catatanTutor && (
                              <p className="text-emerald-800 text-[11px] mt-1.5 italic leading-relaxed">
                                &ldquo;{statusInfo.grade.catatanTutor}&rdquo;
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Tenggat: {formattedDeadline}</span>
                        </div>

                        <button
                          onClick={() => handleOpenSubmitModal(tg)}
                          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all active:scale-95 duration-150 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-1.5"
                        >
                          {statusInfo.submission ? (
                            <>
                              <PenTool className="w-3.5 h-3.5" />
                              <span>Ubah Jawaban</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>Kumpulkan Jawaban</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Pengumpulan Jawaban */}
      {isModalOpen && selectedTugas && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-lg w-full p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block">
                  Formulir Pengumpulan Tugas
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {selectedTugas.judul}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setInputError("");
                }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-5 space-y-4">
              <div className="p-4 rounded-2xl bg-[#F2F2F7]/50 border border-slate-200/60 max-h-36 overflow-y-auto text-xs text-slate-600 leading-relaxed">
                <span className="font-semibold text-slate-700 block mb-1">Instruksi Soal:</span>
                <RichTextRenderer content={selectedTugas.deskripsi} />
              </div>

              {/* Pemilih Tipe Pengumpulan: Teks vs Tautan Dokumen */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Metode Pengumpulan Jawaban:
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-[#F2F2F7]/80 rounded-2xl border border-slate-200/60 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setTipeJawaban("teks");
                      setInputError("");
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 duration-150 ${
                      tipeJawaban === "teks"
                        ? "bg-white text-blue-700 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                    <span>Teks Jawaban Langsung</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTipeJawaban("tautan");
                      setInputError("");
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 duration-150 ${
                      tipeJawaban === "tautan"
                        ? "bg-white text-blue-700 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Tautan Dokumen / Cloud</span>
                  </button>
                </div>

                {tipeJawaban === "teks" ? (
                  <div>
                    <textarea
                      rows={5}
                      value={jawabanInput}
                      onChange={(e) => {
                        setJawabanInput(e.target.value);
                        if (inputError) setInputError("");
                      }}
                      placeholder="Tuliskan jawaban lengkap, uraian analisis, atau kunci jawaban soal di sini..."
                      className="w-full p-3 rounded-lg border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all leading-relaxed"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Ketik jawaban langsung atau salin teks jawaban Anda pada kotak di atas.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="relative">
                      <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="url"
                        value={jawabanInput}
                        onChange={(e) => {
                          setJawabanInput(e.target.value);
                          if (inputError) setInputError("");
                        }}
                        placeholder="https://drive.google.com/... atau https://docs.google.com/..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Pastikan izin akses dokumen di Google Drive / Docs sudah diatur ke <em>&ldquo;Siapa saja yang memiliki tautan dapat melihat&rdquo;</em>.
                    </p>
                  </div>
                )}

                {inputError && (
                  <p className="text-xs text-rose-600 mt-2 font-medium flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {inputError}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setInputError("");
                  }}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Mengirimkan...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim Jawaban Tugas</span>
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
