"use client";

import React, { useState, useRef } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import EmptyState from "../../../components/EmptyState";
import RichTextRenderer from "../../../components/RichTextRenderer";
import { useData } from "../../../context/DataContext";
import { formatDateTime, isPastDate } from "../../../lib/dateUtils";
import {
  PenTool,
  Calendar,
  Clock,
  Plus,
  X,
  CheckCircle2,
  BookOpen,
  Send,
  Loader2,
  Bold,
  Italic,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code,
  FileCode,
  Eye,
  Edit3,
  Sparkles,
  Info,
} from "lucide-react";

export default function TugasTutorPage() {
  const { isLoaded, kelas = [], tugas = [], pengumpulan = [], addTugas, currentUser } = useData();

  const isSuperAdmin = currentUser?.role === "super_admin";
  const allKelas = Array.isArray(kelas) ? kelas : [];
  const safeKelas = isSuperAdmin ? allKelas : allKelas.filter((k) => k.tutorId === currentUser?.id);
  const safeKelasIds = safeKelas.map((k) => k.id);
  const safeTugas = (Array.isArray(tugas) ? tugas : []).filter(
    (t) => isSuperAdmin || safeKelasIds.includes(t.kelasId)
  );
  const safePengumpulan = Array.isArray(pengumpulan) ? pengumpulan : [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editorTab, setEditorTab] = useState("editor"); // "editor" | "preview"
  const [selectedDetailTugas, setSelectedDetailTugas] = useState(null);

  const [formData, setFormData] = useState({
    kelasId: safeKelas[0]?.id || "",
    judul: "",
    deskripsi: "",
    tenggatWaktu: "",
    bobotNilai: 100,
  });

  const textareaRef = useRef(null);

  // Helper untuk menambahkan tenggat waktu preset
  const setPresetDeadline = (days) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    targetDate.setHours(23, 59, 0, 0);

    // Format YYYY-MM-DDTHH:mm untuk datetime-local
    const pad = (n) => String(n).padStart(2, "0");
    const formatted = `${targetDate.getFullYear()}-${pad(targetDate.getMonth() + 1)}-${pad(
      targetDate.getDate()
    )}T${pad(targetDate.getHours())}:${pad(targetDate.getMinutes())}`;

    setFormData((prev) => ({ ...prev, tenggatWaktu: formatted }));
  };

  const handleOpenModal = () => {
    // Default tenggat waktu: 7 hari dari sekarang
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    defaultDate.setHours(23, 59, 0, 0);
    const pad = (n) => String(n).padStart(2, "0");
    const defaultFormatted = `${defaultDate.getFullYear()}-${pad(defaultDate.getMonth() + 1)}-${pad(
      defaultDate.getDate()
    )}T${pad(defaultDate.getHours())}:${pad(defaultDate.getMinutes())}`;

    setFormData({
      kelasId: safeKelas[0]?.id || "",
      judul: "",
      deskripsi: "",
      tenggatWaktu: defaultFormatted,
      bobotNilai: 100,
    });
    setEditorTab("editor");
    setIsModalOpen(true);
  };

  // Helper untuk manipulasi teks pada textarea editor (Rich-Text Formatting)
  const insertFormatting = (prefix, suffix = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.deskripsi;
    const selectedText = text.substring(start, end) || "teks";

    const replacement = `${prefix}${selectedText}${suffix}`;
    const newText = text.substring(0, start) + replacement + text.substring(end);

    setFormData((prev) => ({ ...prev, deskripsi: newText }));

    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  // Template tugas siap pakai
  const applyTemplate = (type) => {
    let template = "";
    if (type === "soal") {
      template = `## Petunjuk Pengerjaan
1. Bacalah modul bimbingan bab terkait secara cermat.
2. Kerjakan soal-soal latihan di bawah ini secara mandiri.
3. Cantumkan langkah penyelesaian lengkap pada dokumen jawaban Anda.

## Daftar Soal Latihan
1. Jelaskan konsep dasar dan rumus utama materi yang dibahas!
2. Selesaikan studi kasus nomor 14 pada buku latihan halaman 82!
3. Buat kesimpulan dan analisis singkat mengenai hasil perhitungan Anda.

> **Catatan:** Format jawaban berupa file PDF atau Google Docs publik. Awali tautan dengan https://`;
    } else if (type === "esai") {
      template = `## Latar Belakang Studi Kasus
Analisis permasalahan kontekstual berdasarkan materi pembelajaran pekan ini.

## Pertanyaan Analisis
- Apa faktor utama penyebab terjadinya masalah tersebut?
- Solusi inovatif apa yang dapat Anda tawarkan secara sistematis?

## Rubrik Kriteria Penilaian
- Kedalaman argumen: **40 poin**
- Sistematika penulisan: **30 poin**
- Bukti dan referensi pendukung: **30 poin**`;
    }

    setFormData((prev) => ({ ...prev, deskripsi: template }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const targetKelasId = formData.kelasId || safeKelas[0]?.id;
    if (!formData.judul || !targetKelasId) return;

    setIsSubmitting(true);
    try {
      await addTugas({
        kelasId: targetKelasId,
        judul: formData.judul,
        deskripsi: formData.deskripsi,
        tenggatWaktu: formData.tenggatWaktu || new Date(Date.now() + 7 * 86400000).toISOString(),
        bobotNilai: Number(formData.bobotNilai) || 100,
      });

      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title="Manajemen Penugasan Siswa (Rich-Text)"
      subtitle="Rancang tugas bimbingan baru dengan editor rich-text, tenggat waktu presisi, dan bobot nilai langsung tersimpan ke Cloud Firestore."
      action={
        <button
          onClick={handleOpenModal}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-sm transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Buat Tugas Baru</span>
        </button>
      }
    >
      <div className="space-y-6">
        {!isLoaded ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-28 bg-slate-200/70 rounded-xl" />
            <div className="h-64 bg-slate-200/70 rounded-xl" />
          </div>
        ) : (
          <>
            {safeKelas.length === 0 && !isSuperAdmin && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900">
                <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Anda belum ditugaskan ke rombongan belajar mana pun</span>
                  <span>Silakan hubungi Staf Admisi untuk mengaitkan akun Anda sebagai Tutor Pengampu pada menu Penempatan Kelas.</span>
                </div>
              </div>
            )}

            {/* Tugas List */}
            <div className="bg-white rounded-3xl border border-slate-200/60 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between pb-5 border-b border-slate-200/60 mb-6">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-slate-900">Daftar Tugas yang Telah Diterbitkan</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Total {safeTugas.length} penugasan aktif dengan dukungan format instruksi terstruktur (PRD Bab 4.4).
                  </p>
                </div>
              </div>

              {safeTugas.length === 0 ? (
                <div className="py-6">
                  <EmptyState
                    title="Belum Ada Tugas Diterbitkan"
                    description="Klik tombol 'Buat Tugas Baru' di atas untuk menerbitkan latihan soal atau tugas berformat rich-text pertama Anda."
                    actionLabel="Buat Tugas Sekarang"
                    onAction={handleOpenModal}
                    icon={PenTool}
                  />
                </div>
              ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {safeTugas.map((t) => {
                const targetKl = safeKelas.find((k) => k.id === t.kelasId);
                const submissionCount = safePengumpulan.filter((p) => p.tugasId === t.id).length;
                const formattedDate = formatDateTime(t.tenggatWaktu);
                const isOverdue = isPastDate(t.tenggatWaktu);

                return (
                  <div
                    key={t.id}
                    className="p-6 rounded-3xl border border-slate-200/60 bg-white hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3.5">
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F2F2F7] text-slate-700 border border-slate-200/50">
                          {targetKl?.nama || "Kelas Bimbingan"}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          Bobot: {t.bobotNilai || 100} Poin
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 leading-snug">{t.judul}</h3>

                      {/* Render Cuplikan Rich-Text */}
                      <div className="mt-3 p-3.5 rounded-2xl bg-[#F2F2F7]/50 border border-slate-200/60 max-h-32 overflow-hidden text-xs text-slate-600">
                        <RichTextRenderer content={t.deskripsi} />
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className={`w-4 h-4 ${isOverdue ? "text-rose-500" : "text-slate-400"}`} />
                        <span className={isOverdue ? "text-rose-600 font-semibold" : ""}>
                          Tenggat: {formattedDate}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedDetailTugas(t)}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          Lihat Detail
                        </button>
                        <span className="font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full text-[11px] border border-blue-200/60">
                          {submissionCount} Jawaban
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        </>
        )}
      </div>

      {/* Modal Detail Tugas Penuh */}
      {selectedDetailTugas && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-xl w-full p-6 sm:p-8 shadow-2xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/60">
              <div>
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                  Detail Penugasan (Rich-Text)
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1 tracking-tight">
                  {selectedDetailTugas.judul}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDetailTugas(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 overflow-y-auto flex-1 space-y-4">
              <div className="p-4 rounded-2xl bg-[#F2F2F7]/50 border border-slate-200/60">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Instruksi & Soal Tugas:
                </h4>
                <RichTextRenderer content={selectedDetailTugas.deskripsi} />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-[#F2F2F7]/50 rounded-2xl border border-slate-200/60">
                  <span className="text-slate-500 block text-[10px] font-medium">Batas Pengumpulan</span>
                  <span className="font-bold text-slate-800">
                    {formatDateTime(selectedDetailTugas.tenggatWaktu)}
                  </span>
                </div>
                <div className="p-3.5 bg-[#F2F2F7]/50 rounded-2xl border border-slate-200/60">
                  <span className="text-slate-500 block text-[10px] font-medium">Bobot Nilai</span>
                  <span className="font-bold text-slate-800">
                    {selectedDetailTugas.bobotNilai || 100} Poin
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200/60 text-right">
              <button
                onClick={() => setSelectedDetailTugas(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs active:scale-95 transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Buat Tugas Baru dengan Rich-Text Toolbar & Live Preview */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-2xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <PenTool className="w-4 h-4 text-blue-600" />
                Buat Tugas Baru (Editor Format Rich-Text)
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4 overflow-y-auto flex-1 pr-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Pilih Kelas Bimbingan <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.kelasId || safeKelas[0]?.id || ""}
                  onChange={(e) => setFormData({ ...formData, kelasId: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/60 text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer"
                >
                  {safeKelas.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.nama} (Kapasitas: {k.siswaIds?.length || 0} Siswa)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Judul Tugas <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  required
                  placeholder="Contoh: Latihan Penalaran Matematika Bab 3 - Limit & Turunan"
                  className="w-full px-4 py-3 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/60 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>

              {/* RICH-TEXT EDITOR SECTION (PRD BAB 4.4) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Instruksi & Soal Tugas (Rich-Text) <span className="text-rose-500">*</span>
                  </label>

                  {/* Mode Tab: Editor vs Preview */}
                  <div className="flex items-center gap-1 bg-[#F2F2F7] p-1 rounded-xl text-xs border border-slate-200/50">
                    <button
                      type="button"
                      onClick={() => setEditorTab("editor")}
                      className={`px-3 py-1 rounded-lg flex items-center gap-1.5 font-medium transition-all ${
                        editorTab === "editor"
                          ? "bg-white text-blue-600 shadow-xs font-semibold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Tulis Format
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorTab("preview")}
                      className={`px-3 py-1 rounded-lg flex items-center gap-1.5 font-medium transition-all ${
                        editorTab === "preview"
                          ? "bg-white text-blue-600 shadow-xs font-semibold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Pratinjau Siswa
                    </button>
                  </div>
                </div>

                {/* Toolbar Format */}
                {editorTab === "editor" && (
                  <div className="border border-b-0 border-slate-200/60 rounded-t-2xl bg-[#F2F2F7]/80 p-2.5 flex flex-wrap items-center gap-1.5 text-slate-600">
                    <button
                      type="button"
                      onClick={() => insertFormatting("**", "**")}
                      className="p-1.5 rounded-lg hover:bg-slate-200 hover:text-slate-900 transition-colors"
                      title="Tebal (Bold)"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting("*", "*")}
                      className="p-1.5 rounded-lg hover:bg-slate-200 hover:text-slate-900 transition-colors"
                      title="Miring (Italic)"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-px h-4 bg-slate-300 mx-1" />
                    <button
                      type="button"
                      onClick={() => insertFormatting("## ")}
                      className="p-1.5 rounded-lg hover:bg-slate-200 hover:text-slate-900 transition-colors"
                      title="Judul Bagian (H2)"
                    >
                      <Heading2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting("- ")}
                      className="p-1.5 rounded-lg hover:bg-slate-200 hover:text-slate-900 transition-colors"
                      title="Daftar Poin (List)"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting("1. ")}
                      className="p-1.5 rounded-lg hover:bg-slate-200 hover:text-slate-900 transition-colors"
                      title="Daftar Nomor (Numbered List)"
                    >
                      <ListOrdered className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting("> ")}
                      className="p-1.5 rounded-lg hover:bg-slate-200 hover:text-slate-900 transition-colors"
                      title="Kutipan / Catatan Penting"
                    >
                      <Quote className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting("`", "`")}
                      className="p-1.5 rounded-lg hover:bg-slate-200 hover:text-slate-900 transition-colors"
                      title="Rumus / Kode Singkat"
                    >
                      <Code className="w-3.5 h-3.5" />
                    </button>

                    <div className="ml-auto flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-400 hidden sm:inline">Template:</span>
                      <button
                        type="button"
                        onClick={() => applyTemplate("soal")}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200/80 hover:bg-blue-50 hover:text-blue-700 text-[11px] font-semibold transition-colors"
                      >
                        Soal Bimbingan
                      </button>
                      <button
                        type="button"
                        onClick={() => applyTemplate("esai")}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200/80 hover:bg-blue-50 hover:text-blue-700 text-[11px] font-semibold transition-colors"
                      >
                        Esai & Rubrik
                      </button>
                    </div>
                  </div>
                )}

                {/* Editor vs Live Preview Content */}
                {editorTab === "editor" ? (
                  <textarea
                    ref={textareaRef}
                    rows={6}
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    required
                    placeholder="Tuliskan petunjuk pengerjaan, soal latihan, atau gunakan template di atas..."
                    className="w-full p-4 rounded-b-2xl border border-slate-200/60 bg-[#F2F2F7]/40 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-mono"
                  />
                ) : (
                  <div className="w-full p-5 rounded-2xl border border-slate-200/60 bg-[#F2F2F7]/40 min-h-[160px] max-h-60 overflow-y-auto">
                    {formData.deskripsi.trim() ? (
                      <RichTextRenderer content={formData.deskripsi} />
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        Belum ada teks instruksi yang ditulis.
                      </span>
                    )}
                  </div>
                )}

                <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                  Format didukung: **tebal**, *miring*, ## judul, - poin, 1. nomor, dan &gt; catatan penting.
                </p>
              </div>

              {/* TENGGAT WAKTU & BOBOT NILAI */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Tenggat Waktu <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center gap-1 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setPresetDeadline(3)}
                        className="px-2 py-0.5 rounded-md bg-[#F2F2F7] hover:bg-slate-200 text-slate-600 font-semibold"
                      >
                        +3H
                      </button>
                      <button
                        type="button"
                        onClick={() => setPresetDeadline(7)}
                        className="px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold"
                      >
                        +7H (1 Mgg)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPresetDeadline(14)}
                        className="px-2 py-0.5 rounded-md bg-[#F2F2F7] hover:bg-slate-200 text-slate-600 font-semibold"
                      >
                        +14H
                      </button>
                    </div>
                  </div>
                  <input
                    type="datetime-local"
                    value={formData.tenggatWaktu}
                    onChange={(e) => setFormData({ ...formData, tenggatWaktu: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/60 text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Bobot Nilai Maksimal <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={formData.bobotNilai}
                    onChange={(e) => setFormData({ ...formData, bobotNilai: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/60 text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs active:scale-95 transition-all duration-150 flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Mempublikasikan...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Publikasikan Tugas</span>
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
