"use client";

import React, { useState } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import EmptyState from "../../../components/EmptyState";
import { useData } from "../../../context/DataContext";
import { formatDateTime } from "../../../lib/dateUtils";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  Send,
  X,
  Loader2,
  Sparkles,
  Info,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  Check,
} from "lucide-react";

export default function ProgramSiswaPage() {
  const {
    isLoaded,
    currentUser,
    program = [],
    pendaftaran = [],
    addPendaftaran,
    addProgram,
    updateProgram,
    deleteProgram,
  } = useData();

  const isSuperAdmin =
    currentUser?.role === "super_admin" || currentUser?.role === "admin";

  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [selectedProgramModal, setSelectedProgramModal] = useState(null);
  const [catatan, setCatatan] = useState("");
  const [modalCatatan, setModalCatatan] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Modal Tambah Program Baru (Super Admin)
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

  // State Modal Edit Program (Super Admin)
  const [editingProgram, setEditingProgram] = useState(null);
  const [isEditingProgram, setIsEditingProgram] = useState(false);

  // State Modal Hapus Program (Super Admin)
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

  const safePendaftaran = Array.isArray(pendaftaran) ? pendaftaran : [];
  const safeProgram = Array.isArray(program) ? program : [];

  // Filter pendaftaran milik siswa aktif
  const myPendaftaran = safePendaftaran.filter((p) => p.siswaId === currentUser?.id);

  // Program yang dipilih dari form dropdown atas
  const currentSelectedProgram = safeProgram.find((p) => p.id === selectedProgramId);

  const handleQuickFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProgramId) return;

    setIsSubmitting(true);
    try {
      const success = await addPendaftaran(selectedProgramId, catatan);
      if (success) {
        setSelectedProgramId("");
        setCatatan("");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenModal = (prog) => {
    setSelectedProgramModal(prog);
    setModalCatatan("");
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProgramModal) return;

    setIsSubmitting(true);
    try {
      const success = await addPendaftaran(selectedProgramModal.id, modalCatatan);
      if (success) {
        setIsModalOpen(false);
        setModalCatatan("");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "disetujui":
      case "aktif":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Disetujui
          </span>
        );
      case "ditolak":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20">
            <XCircle className="w-3.5 h-3.5" />
            Ditolak
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20">
            <Clock className="w-3.5 h-3.5" />
            Menunggu
          </span>
        );
    }
  };

  return (
    <DashboardLayout
      title="Pendaftaran & Pengajuan Program Belajar"
      subtitle="Pilih program bimbingan belajar terbaik dan pantau verifikasi langsung dari staf admisi."
    >
      <div className="space-y-8">
        {/* Skeleton Loading State */}
        {!isLoaded ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-44 bg-slate-200/70 rounded-xl" />
            <div className="h-64 bg-slate-200/70 rounded-xl" />
          </div>
        ) : (
          <>
            {/* Form Pendaftaran Program Cepat */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 overflow-hidden">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-5">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center ring-1 ring-inset ring-blue-600/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Formulir Pengajuan Program Bimbel
                  </h2>
                  <p className="text-xs text-slate-500">
                    Pilih program dari koleksi sistem untuk mendaftar sebagai peserta bimbingan baru.
                  </p>
                </div>
              </div>

              <form onSubmit={handleQuickFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Pilih Program Bimbel <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedProgramId}
                      onChange={(e) => setSelectedProgramId(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="">-- Pilih Program Bimbingan --</option>
                      {safeProgram.map((prog) => {
                        const alreadyApplied = myPendaftaran.some(
                          (p) => p.programId === prog.id && p.status !== "ditolak"
                        );
                        return (
                          <option
                            key={prog.id}
                            value={prog.id}
                            disabled={alreadyApplied}
                          >
                            {prog.nama} ({prog.durasi || "Reguler"} - {prog.biaya || "Tersedia"})
                            {alreadyApplied ? " [Sudah Diajukan]" : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Catatan Tambahan untuk Staf Admisi (Opsional)
                    </label>
                    <input
                      type="text"
                      value={catatan}
                      onChange={(e) => setCatatan(e.target.value)}
                      placeholder="Contoh: Ingin fokus pada TPS Kuantitatif dan Penalaran Matematika"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Preview Info Program Terpilih */}
                {currentSelectedProgram && (
                  <div className="p-4 rounded-lg bg-blue-50/70 border border-blue-200/80 text-xs text-blue-900 space-y-1 animate-in fade-in">
                    <div className="font-bold flex items-center justify-between">
                      <span>{currentSelectedProgram.nama}</span>
                      <span className="font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                        Biaya: {currentSelectedProgram.biaya} &bull; {currentSelectedProgram.durasi}
                      </span>
                    </div>
                    <p className="text-blue-700 text-[11px] leading-relaxed">
                      {currentSelectedProgram.deskripsi}
                    </p>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={!selectedProgramId || isSubmitting}
                    className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold text-xs shadow-sm transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Mengirim Pengajuan...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim Formulir Pendaftaran</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Riwayat Pengajuan Program */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Riwayat Pengajuan Program Saya
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Status verifikasi pendaftaran langsung terhubung dengan koleksi Cloud Firestore.
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-md">
                  {myPendaftaran.length} Diajukan
                </span>
              </div>

              {myPendaftaran.length === 0 ? (
                <div className="p-8">
                  <EmptyState
                    title="Belum Ada Pengajuan Program"
                    description="Gunakan formulir di atas atau pilih salah satu kartu program di bawah untuk mengajukan bimbingan belajar."
                    icon={BookOpen}
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs font-semibold tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Nama Program</th>
                        <th className="px-6 py-4">Tanggal Diajukan</th>
                        <th className="px-6 py-4">Status Staf</th>
                        <th className="px-6 py-4">Catatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {myPendaftaran.map((item) => {
                        const prog = safeProgram.find((p) => p.id === item.programId);
                        const formattedDate = formatDateTime(item.tanggalDaftar);

                        return (
                          <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-semibold text-slate-900">
                                {prog?.nama || "Program Bimbel"}
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                {prog?.biaya} &bull; {prog?.durasi}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                              {formattedDate}
                            </td>
                            <td className="px-6 py-4">
                              {getStatusBadge(item.status)}
                            </td>
                            <td className="px-6 py-4 text-slate-500 italic">
                              {item.catatanStaf ? (
                                <span className="text-rose-600 not-italic font-medium">
                                  Catatan Staf: {item.catatanStaf}
                                </span>
                              ) : (
                                item.catatan || "-"
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Katalog Pilihan Program Tersedia */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    Katalog Program Bimbingan Belajar Tersedia
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {isSuperAdmin
                      ? "Kelola katalog program bimbel: Buat baru, edit tarif & fasilitas, atau hapus program dari Cloud Firestore."
                      : "Pilih program sesuai target kelulusan impian Anda (SNBT UTBK, Kedinasan, atau Reguler)."}
                  </p>
                </div>

                {isSuperAdmin && (
                  <button
                    onClick={() => setIsAddProgramOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs active:scale-95 duration-150 transition-all self-start sm:self-auto shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Program Baru</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {safeProgram.map((p) => {
                  const alreadyRegistered = myPendaftaran.find(
                    (item) => item.programId === p.id && item.status !== "ditolak"
                  );

                  return (
                    <div
                      key={p.id}
                      className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-xs hover:border-blue-300 transition-all duration-200 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20">
                            {p.durasi || "Reguler"}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-blue-600">{p.biaya}</span>
                            {isSuperAdmin && (
                              <div className="flex items-center gap-1 ml-1.5">
                                <button
                                  onClick={() => setEditingProgram(p)}
                                  className="p-1 rounded-lg border border-slate-200/80 hover:bg-blue-50 hover:text-blue-600 text-slate-500 transition-colors shadow-xs"
                                  title="Edit Detail Program"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => setDeletingProgram(p)}
                                  className="p-1 rounded-lg border border-slate-200/80 hover:bg-rose-50 hover:text-rose-600 text-slate-500 transition-colors shadow-xs"
                                  title="Hapus Program"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 leading-snug">{p.nama}</h3>
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed">{p.deskripsi}</p>

                        <div className="mt-5 pt-4 border-t border-slate-100">
                          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
                            Fasilitas Program:
                          </div>
                          <ul className="space-y-2 text-xs text-slate-600">
                            {p.fasilitas?.map((f, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100">
                        {isSuperAdmin ? (
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => setEditingProgram(p)}
                              className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                            >
                              <Pencil className="w-3 h-3" />
                              <span>Edit Data</span>
                            </button>
                            <button
                              onClick={() => setDeletingProgram(p)}
                              className="w-full py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        ) : alreadyRegistered ? (
                          <div className="w-full py-2.5 px-3 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium text-center flex items-center justify-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Sudah Diajukan ({alreadyRegistered.status})</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenModal(p)}
                            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center gap-2 active:scale-95 duration-150"
                          >
                            <span>Ajukan Program Ini</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal Siswa: Pengajuan Program */}
      {isModalOpen && selectedProgramModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200/80 max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Konfirmasi Pengajuan Program
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="mt-4 space-y-4">
              <div className="p-3.5 bg-blue-50 rounded-2xl ring-1 ring-inset ring-blue-600/20 text-xs">
                <div className="font-bold text-blue-900">{selectedProgramModal.nama}</div>
                <div className="text-blue-700 mt-1">
                  Biaya: {selectedProgramModal.biaya} &bull; Durasi: {selectedProgramModal.durasi}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Catatan untuk Staf Admisi (Opsional)
                </label>
                <textarea
                  rows={3}
                  value={modalCatatan}
                  onChange={(e) => setModalCatatan(e.target.value)}
                  placeholder="Tuliskan motivasi belajar atau permintaan khusus kelas..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5 active:scale-95 duration-150"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim Pengajuan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Super Admin: Tambah Program Baru */}
      {isAddProgramOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200/80 max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Tambah Program Baru</h3>
                  <p className="text-xs text-slate-500">Publikasikan program bimbingan ke koleksi program Firestore</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddProgramOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddProgramSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nama Program <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newProgramData.nama}
                  onChange={(e) =>
                    setNewProgramData({ ...newProgramData, nama: e.target.value })
                  }
                  placeholder="Misal: Intensif SNBT UTBK 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Deskripsi Lengkap <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={newProgramData.deskripsi}
                  onChange={(e) =>
                    setNewProgramData({ ...newProgramData, deskripsi: e.target.value })
                  }
                  placeholder="Penjelasan sasaran pembelajaran program..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Biaya / Tarif Program
                  </label>
                  <input
                    type="text"
                    value={newProgramData.biaya}
                    onChange={(e) =>
                      setNewProgramData({ ...newProgramData, biaya: e.target.value })
                    }
                    placeholder="Rp 2.500.000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Durasi Bimbingan
                  </label>
                  <input
                    type="text"
                    value={newProgramData.durasi}
                    onChange={(e) =>
                      setNewProgramData({ ...newProgramData, durasi: e.target.value })
                    }
                    placeholder="6 Bulan"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Target Siswa
                  </label>
                  <input
                    type="text"
                    value={newProgramData.target}
                    onChange={(e) =>
                      setNewProgramData({ ...newProgramData, target: e.target.value })
                    }
                    placeholder="Kelas 12 & Gap Year"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Kapasitas / Kuota
                  </label>
                  <input
                    type="number"
                    value={newProgramData.kuota}
                    onChange={(e) =>
                      setNewProgramData({ ...newProgramData, kuota: e.target.value })
                    }
                    placeholder="50"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Fasilitas (Pisahkan dengan tanda koma)
                </label>
                <input
                  type="text"
                  value={newProgramData.fasilitas}
                  onChange={(e) =>
                    setNewProgramData({ ...newProgramData, fasilitas: e.target.value })
                  }
                  placeholder="3x Pertemuan/Minggu, Modul Lengkap, Tryout CBT"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddProgramOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProgram}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5 active:scale-95 duration-150"
                >
                  {isSubmittingProgram ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Publikasikan Program</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Super Admin: Edit Program */}
      {editingProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200/80 max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Edit Detail Program</h3>
                  <p className="text-xs text-slate-500">Perbarui data program di koleksi program Firestore</p>
                </div>
              </div>
              <button
                onClick={() => setEditingProgram(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditProgramSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nama Program <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingProgram.nama || ""}
                  onChange={(e) =>
                    setEditingProgram({ ...editingProgram, nama: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Deskripsi Lengkap <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={editingProgram.deskripsi || ""}
                  onChange={(e) =>
                    setEditingProgram({ ...editingProgram, deskripsi: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Biaya / Tarif Program
                  </label>
                  <input
                    type="text"
                    value={editingProgram.biaya || ""}
                    onChange={(e) =>
                      setEditingProgram({ ...editingProgram, biaya: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Durasi Bimbingan
                  </label>
                  <input
                    type="text"
                    value={editingProgram.durasi || ""}
                    onChange={(e) =>
                      setEditingProgram({ ...editingProgram, durasi: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Target Siswa
                  </label>
                  <input
                    type="text"
                    value={editingProgram.target || ""}
                    onChange={(e) =>
                      setEditingProgram({ ...editingProgram, target: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Kapasitas / Kuota
                  </label>
                  <input
                    type="number"
                    value={editingProgram.kuota || 0}
                    onChange={(e) =>
                      setEditingProgram({ ...editingProgram, kuota: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Fasilitas (Pisahkan dengan tanda koma)
                </label>
                <input
                  type="text"
                  value={
                    Array.isArray(editingProgram.fasilitas)
                      ? editingProgram.fasilitas.join(", ")
                      : editingProgram.fasilitas || ""
                  }
                  onChange={(e) =>
                    setEditingProgram({
                      ...editingProgram,
                      fasilitas: e.target.value.split(",").map((s) => s.trim()),
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingProgram(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isEditingProgram}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5 active:scale-95 duration-150"
                >
                  {isEditingProgram ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Super Admin: Hapus Program */}
      {deletingProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200/80 max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Hapus Program Bimbingan?</h3>
                <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs text-slate-700 space-y-1 mb-5">
              <div>
                <span className="font-semibold text-slate-900">Program:</span> {deletingProgram.nama}
              </div>
              <div>
                <span className="font-semibold text-slate-900">Biaya:</span> {deletingProgram.biaya}
              </div>
              <div>
                <span className="font-semibold text-slate-900">Durasi:</span> {deletingProgram.durasi}
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Apakah Anda yakin ingin menghapus program ini dari katalog Cloud Firestore? Calon siswa tidak akan lagi dapat mendaftar ke program ini.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingProgram(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteProgramConfirm}
                disabled={isDeletingProgram}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5 active:scale-95 duration-150"
              >
                {isDeletingProgram ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Ya, Hapus Program</span>
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
