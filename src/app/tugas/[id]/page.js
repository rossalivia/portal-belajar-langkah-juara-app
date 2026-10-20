"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "../../../components/DashboardLayout";
import EmptyState from "../../../components/EmptyState";
import RichTextRenderer from "../../../components/RichTextRenderer";
import ForumDiskusiTugas from "../../../components/ForumDiskusiTugas";
import { useData } from "../../../context/DataContext";
import {
  FileText,
  CheckCircle2,
  Clock,
  Send,
  Calendar,
  AlertCircle,
  ArrowLeft,
  Loader2,
  ExternalLink,
  Award,
  Link as LinkIcon,
} from "lucide-react";

export default function DetailTugasPage() {
  const params = useParams();
  const router = useRouter();
  const {
    currentUser,
    kelas = [],
    tugas = [],
    pengumpulan = [],
    penilaian = [],
    submitTugas,
  } = useData();

  const [jawabanInput, setJawabanInput] = useState("");
  const [urlError, setUrlError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasInit, setHasInit] = useState(false);

  const tugasId = params?.id;

  const safeKelas = Array.isArray(kelas) ? kelas : [];
  const safeTugas = Array.isArray(tugas) ? tugas : [];
  const safePengumpulan = Array.isArray(pengumpulan) ? pengumpulan : [];
  const safePenilaian = Array.isArray(penilaian) ? penilaian : [];

  const targetTugas = safeTugas.find((t) => t.id === tugasId);
  const targetKelas = safeKelas.find((k) => k.id === targetTugas?.kelasId);

  const submission = safePengumpulan.find(
    (p) => p.tugasId === tugasId && p.siswaId === currentUser?.id
  );
  const grade = submission
    ? safePenilaian.find((pn) => pn.pengumpulanId === submission.id)
    : null;

  if (submission && !hasInit) {
    setJawabanInput(submission.jawaban || "");
    setHasInit(true);
  }

  // Kalkulasi 4 Status Dinamis Sesuai PRD
  // 1. Dinilai: #15A66A
  // 2. Dikumpulkan: #F59E0B
  // 3. Terlambat: #E53935
  // 4. Belum dikumpulkan: #6B7280
  const getStatusInfo = () => {
    if (!targetTugas) return null;

    const isGraded = !!grade || (submission && submission.nilai != null);
    if (isGraded) {
      return {
        key: "dinilai",
        label: "Dinilai",
        color: "#15A66A",
        bgClass: "bg-[#15A66A]/10 text-[#15A66A] border-[#15A66A]/30",
      };
    }

    if (submission) {
      return {
        key: "dikumpulkan",
        label: "Dikumpulkan",
        color: "#F59E0B",
        bgClass: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30",
      };
    }

    const isOverdue = targetTugas.tenggatWaktu
      ? new Date() > new Date(targetTugas.tenggatWaktu)
      : false;
    if (isOverdue) {
      return {
        key: "terlambat",
        label: "Terlambat",
        color: "#E53935",
        bgClass: "bg-[#E53935]/10 text-[#E53935] border-[#E53935]/30",
      };
    }

    return {
      key: "belum",
      label: "Belum dikumpulkan",
      color: "#6B7280",
      bgClass: "bg-[#6B7280]/10 text-[#6B7280] border-[#6B7280]/30",
    };
  };

  const statusInfo = getStatusInfo();

  // Validasi Regex HTTPS
  const isValidHttpsUrl = (str) => {
    if (!str) return false;
    const trimmed = str.trim();
    return /^https:\/\/\S+/i.test(trimmed);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetTugas) return;

    const trimmedJawaban = jawabanInput.trim();
    if (!trimmedJawaban) {
      setUrlError("Tautan jawaban tugas wajib diisi.");
      return;
    }

    if (!isValidHttpsUrl(trimmedJawaban)) {
      setUrlError(
        "Tautan jawaban tugas wajib diawali dengan https:// (contoh: https://drive.google.com/... atau https://docs.google.com/...)"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await submitTugas(targetTugas.id, trimmedJawaban);
      if (success) {
        setUrlError("");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!targetTugas) {
    return (
      <DashboardLayout title="Detail Tugas" subtitle="Memeriksa data tugas...">
        <div className="bg-white p-8 rounded-xl border border-slate-200/80 shadow-sm">
          <EmptyState
            title="Tugas Tidak Ditemukan"
            description="Tugas yang Anda cari tidak tersedia atau ID tugas tidak valid."
            actionLabel="Kembali ke Daftar Tugas"
            onAction={() => router.push("/beranda/tugas")}
            icon={FileText}
          />
        </div>
      </DashboardLayout>
    );
  }

  const formattedDate = new Date(targetTugas.tenggatWaktu).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <DashboardLayout
      title="Lembar Penugasan Siswa"
      subtitle={`Kelas: ${targetKelas?.nama || "Bimbingan Belajar"} • Tenggat: ${formattedDate}`}
    >
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Tombol Kembali */}
        <div>
          <Link
            href="/beranda/tugas"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Daftar Tugas</span>
          </Link>
        </div>

        {/* Card Header & Deskripsi Tugas */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                {targetKelas?.nama || "Kelas Bimbingan"}
              </span>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 mt-2">
                {targetTugas.judul}
              </h1>
            </div>

            {/* Badge Status Sesuai PRD */}
            {statusInfo && (
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full border self-start sm:self-auto ${statusInfo.bgClass}`}
                style={{ color: statusInfo.color }}
              >
                {statusInfo.key === "dinilai" && <CheckCircle2 className="w-4 h-4" />}
                {statusInfo.key === "dikumpulkan" && <Clock className="w-4 h-4" />}
                {statusInfo.key === "terlambat" && <AlertCircle className="w-4 h-4" />}
                {statusInfo.key === "belum" && <FileText className="w-4 h-4" />}
                {statusInfo.label}
              </span>
            )}
          </div>

          <div>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Instruksi Lengkap Tugas (Format Terstruktur)
            </h2>
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
              <RichTextRenderer content={targetTugas.deskripsi} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/60 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-500 block text-[11px]">Batas Pengumpulan</span>
                <span className="font-semibold text-slate-900">{formattedDate}</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/60 flex items-center gap-3">
              <Award className="w-5 h-5 text-blue-500 shrink-0" />
              <div>
                <span className="text-slate-500 block text-[11px]">Bobot Maksimal</span>
                <span className="font-semibold text-slate-900">
                  {targetTugas.bobotNilai || 100} Poin
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card Hasil Penilaian Jika Ada */}
        {statusInfo?.key === "dinilai" && (
          <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Hasil Evaluasi & Penilaian Tutor
              </div>
              <div className="text-lg font-extrabold text-emerald-800">
                Nilai: {grade?.nilai ?? submission?.nilai}/100
              </div>
            </div>
            {(grade?.catatanTutor || submission?.catatanTutor) && (
              <p className="text-xs text-emerald-800 italic bg-white/70 p-3 rounded-lg border border-emerald-200/60">
                "{grade?.catatanTutor || submission?.catatanTutor}"
              </p>
            )}
          </div>
        )}

        {/* Card Form Pengumpulan Jawaban */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 md:p-8 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
            <Send className="w-4 h-4 text-blue-600" />
            {submission ? "Perbarui Pengumpulan Jawaban" : "Formulir Pengumpulan Tugas"}
          </h2>
          <p className="text-xs text-slate-500 mb-5">
            Sematkan tautan dokumen Google Docs, PDF Drive, atau repository tugas Anda yang telah diatur izin akses publiknya.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Tautan Jawaban (URL HTTPS) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="url"
                  value={jawabanInput}
                  onChange={(e) => {
                    setJawabanInput(e.target.value);
                    if (urlError) setUrlError("");
                  }}
                  required
                  placeholder="https://drive.google.com/... atau https://docs.google.com/..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Sesuai PRD, tautan wajib diawali protokol aman <strong>https://</strong>
              </p>
              {urlError && (
                <p className="text-xs text-rose-600 mt-1.5 font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {urlError}
                </p>
              )}
            </div>

            {submission && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[11px]">Jawaban Terakhir Dikumpulkan:</span>
                  <a
                    href={submission.jawaban}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                  >
                    {submission.jawaban}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="text-right text-[11px] text-slate-500">
                  {new Date(submission.tanggalKumpul).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan Pengumpulan...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{submission ? "Perbarui Jawaban Tugas" : "Kirimkan Jawaban Tugas"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Forum Diskusi & Tanya Jawab Interaktif per Tugas */}
        <ForumDiskusiTugas tugasId={targetTugas.id} currentUser={currentUser} />
      </div>
    </DashboardLayout>
  );
}
