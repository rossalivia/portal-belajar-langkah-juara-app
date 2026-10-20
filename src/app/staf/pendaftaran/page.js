"use client";

import React, { useState } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import EmptyState from "../../../components/EmptyState";
import { useData } from "../../../context/DataContext";
import { formatDateTime } from "../../../lib/dateUtils";
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  X,
  Mail,
  Phone,
  School,
  BookOpen,
  Calendar,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function PersetujuanPendaftaranPage() {
  const { isLoaded, pendaftaran = [], users = [], program = [], updatePendaftaranStatus } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("menunggu"); // Default ke 'menunggu' agar staf langsung fokus pada pengajuan baru
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [catatanStaf, setCatatanStaf] = useState("");
  const [rejectError, setRejectError] = useState("");

  const safePendaftaran = Array.isArray(pendaftaran) ? pendaftaran : [];
  const safeUsers = Array.isArray(users) ? users : [];
  const safeProgram = Array.isArray(program) ? program : [];

  const waitingCount = safePendaftaran.filter((p) => p.status === "menunggu").length;
  const approvedCount = safePendaftaran.filter((p) => p.status === "disetujui" || p.status === "aktif").length;
  const rejectedCount = safePendaftaran.filter((p) => p.status === "ditolak").length;

  const filteredPendaftaran = safePendaftaran.filter((item) => {
    const siswa = safeUsers.find((u) => u.id === item.siswaId);
    const prog = safeProgram.find((p) => p.id === item.programId);

    const nama = siswa?.nama || "";
    const email = siswa?.email || "";
    const progNama = prog?.nama || "";
    const sekolah = siswa?.sekolah || "";

    const matchesSearch =
      nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      progNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sekolah.toLowerCase().includes(searchQuery.toLowerCase());

    const isItemApproved = item.status === "disetujui" || item.status === "aktif";
    const matchesStatus =
      statusFilter === "semua" ||
      (statusFilter === "disetujui" && isItemApproved) ||
      item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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

  const handleUpdateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await updatePendaftaranStatus(id, status);
      if (selectedItem?.id === id) {
        setSelectedItem((prev) => (prev ? { ...prev, status } : null));
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const handleInitiateReject = (item) => {
    setRejectTarget(item);
    setCatatanStaf(item.catatanStaf || "");
    setRejectError("");
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!catatanStaf.trim()) {
      setRejectError("Catatan penolakan wajib diisi untuk memberikan alasan kepada siswa.");
      return;
    }
    if (!rejectTarget) return;

    setUpdatingId(rejectTarget.id);
    try {
      await updatePendaftaranStatus(rejectTarget.id, "ditolak", catatanStaf.trim());
      if (selectedItem?.id === rejectTarget.id) {
        setSelectedItem((prev) =>
          prev ? { ...prev, status: "ditolak", catatanStaf: catatanStaf.trim() } : null
        );
      }
      setIsRejectModalOpen(false);
      setRejectTarget(null);
      setCatatanStaf("");
      setRejectError("");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenDetail = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  return (
    <DashboardLayout
      title="Persetujuan & Verifikasi Pendaftaran"
      subtitle="Verifikasi pengajuan program siswa baru. Setujui atau tolak dengan pembaruan instan ke Cloud Firestore."
    >
      <div className="space-y-6">
        {/* Filter & Search Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/60 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama siswa, email, atau program..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/60 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-[#F2F2F7]/80 rounded-2xl border border-slate-200/60 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setStatusFilter("menunggu")}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 active:scale-95 duration-150 ${
                statusFilter === "menunggu"
                  ? "bg-white text-amber-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Menunggu</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                {waitingCount}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter("disetujui")}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 active:scale-95 duration-150 ${
                statusFilter === "disetujui"
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Disetujui</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                {approvedCount}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter("ditolak")}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 active:scale-95 duration-150 ${
                statusFilter === "ditolak"
                  ? "bg-white text-rose-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Ditolak</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/60">
                {rejectedCount}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter("semua")}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 active:scale-95 duration-150 ${
                statusFilter === "semua"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Semua ({safePendaftaran.length})
            </button>
          </div>
        </div>

        {/* Tabel Data Pendaftaran */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/60 bg-white shadow-xs">
          {!isLoaded ? (
            <div className="p-8 space-y-4 animate-pulse">
              <div className="h-10 bg-slate-100 rounded-xl" />
              <div className="h-12 bg-slate-100 rounded-xl" />
              <div className="h-12 bg-slate-100 rounded-xl" />
            </div>
          ) : filteredPendaftaran.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="Tidak Ada Pendaftaran"
                description={
                  statusFilter === "menunggu"
                    ? "Bagus sekali! Tidak ada pengajuan siswa yang menunggu verifikasi saat ini."
                    : "Tidak ada data pendaftaran yang cocok dengan filter atau kata kunci pencarian."
                }
                actionLabel="Lihat Semua Pendaftaran"
                onAction={() => {
                  setSearchQuery("");
                  setStatusFilter("semua");
                }}
              />
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 text-slate-500 uppercase text-[11px] font-semibold tracking-wider px-6 py-4 border-b border-slate-200/60">
                <tr>
                  <th className="px-6 py-4">Nama Siswa</th>
                  <th className="px-6 py-4">Program Dipilih</th>
                  <th className="px-6 py-4">Tanggal Daftar</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi Verifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPendaftaran.map((item) => {
                  const siswa = safeUsers.find((u) => u.id === item.siswaId);
                  const prog = safeProgram.find((p) => p.id === item.programId);
                  const isProcessing = updatingId === item.id;
                  const formattedDate = formatDateTime(item.tanggalDaftar);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{siswa?.nama || "Siswa Baru"}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{siswa?.email || "-"} &bull; {siswa?.sekolah || "-"}</div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">{prog?.nama || "Program Bimbel"}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{prog?.biaya}</div>
                        </td>

                        <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                          {formattedDate}
                        </td>

                        <td className="px-6 py-4">
                          {getStatusBadge(item.status)}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenDetail(item)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                              title="Lihat Detail Pendaftaran"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {isProcessing ? (
                              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                            ) : (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(item.id, "disetujui")}
                                  disabled={item.status === "disetujui" || item.status === "aktif"}
                                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 shadow-xs text-xs font-semibold transition-all duration-200 flex items-center gap-1.5"
                                  title="Setujui pendaftaran siswa"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Setuju</span>
                                </button>
                                <button
                                  onClick={() => handleInitiateReject(item)}
                                  disabled={item.status === "ditolak"}
                                  className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 ring-1 ring-inset ring-rose-600/20 text-xs font-semibold disabled:opacity-40 transition-all duration-200"
                                  title="Tolak pendaftaran dengan catatan"
                                >
                                  Tolak
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
          )}
        </div>
      </div>

      {/* Modal Detail Pendaftaran */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-lg w-full p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                Detail Berkas Pendaftaran
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {(() => {
              const siswa = safeUsers.find((u) => u.id === selectedItem.siswaId);
              const prog = safeProgram.find((p) => p.id === selectedItem.programId);
              return (
                <div className="mt-5 space-y-4">
                  <div className="p-4 bg-[#F2F2F7]/60 rounded-2xl border border-slate-200/60 space-y-2 text-xs">
                    <div className="font-bold text-slate-900 text-sm">{siswa?.nama || "Siswa Baru"}</div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{siswa?.email || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <School className="w-3.5 h-3.5 text-slate-400" />
                      <span>Sekolah: {siswa?.sekolah || "-"}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-100 text-xs">
                    <div className="font-semibold text-blue-900">{prog?.nama || "Program Bimbel"}</div>
                    <div className="text-blue-700 mt-1">Biaya: {prog?.biaya} &bull; Durasi: {prog?.durasi}</div>
                  </div>

                  <div className="text-xs space-y-1.5">
                    <span className="font-semibold text-slate-500 uppercase tracking-wider block">
                      Catatan Pengajuan Siswa:
                    </span>
                    <p className="text-slate-700 italic bg-[#F2F2F7]/40 p-3.5 rounded-2xl border border-slate-200/60 leading-relaxed">
                      {selectedItem.catatan || "Tidak ada catatan khusus dari siswa."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-xs text-slate-500">Status Saat Ini:</span>
                    {getStatusBadge(selectedItem.status)}
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleUpdateStatus(selectedItem.id, "disetujui")}
                      disabled={selectedItem.status === "disetujui" || updatingId === selectedItem.id}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold disabled:opacity-40 transition-all active:scale-95 duration-150 flex items-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Setuju Sekarang</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsModalOpen(false);
                        handleInitiateReject(selectedItem);
                      }}
                      disabled={selectedItem.status === "ditolak"}
                      className="px-4 py-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60 text-xs font-semibold disabled:opacity-40 transition-all active:scale-95 duration-150"
                    >
                      Tolak Pengajuan
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Modal Penolakan Pendaftaran */}
      {isRejectModalOpen && rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-md w-full p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <h3 className="text-base font-bold text-rose-600 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Tolak Pendaftaran Siswa
              </h3>
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3.5 text-xs text-slate-600 leading-relaxed">
              Berikan catatan alasan penolakan berkas pendaftaran ini kepada siswa.
            </div>

            <div className="mt-3.5">
              <textarea
                rows={3}
                value={catatanStaf}
                onChange={(e) => {
                  setCatatanStaf(e.target.value);
                  if (rejectError) setRejectError("");
                }}
                placeholder="Contoh: Kuota kelas reguler telah penuh atau berkas belum lengkap..."
                className="w-full px-4 py-3 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/60 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all"
              />
              {rejectError && (
                <div className="text-[11px] text-rose-600 mt-1.5 font-medium">{rejectError}</div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-5 pt-4 border-t border-slate-100">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100/80 active:scale-95 duration-150 transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={updatingId === rejectTarget.id}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all active:scale-95 duration-150 flex items-center gap-1.5 shadow-xs"
              >
                {updatingId === rejectTarget.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Konfirmasi Tolak</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
