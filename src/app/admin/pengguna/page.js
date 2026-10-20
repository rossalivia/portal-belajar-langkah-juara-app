"use client";

import React, { useState } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import EmptyState from "../../../components/EmptyState";
import { useData } from "../../../context/DataContext";
import {
  Users,
  Search,
  ShieldCheck,
  UserCog,
  Loader2,
  Sparkles,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  X,
  UserPlus,
  Pencil,
  Check,
} from "lucide-react";

export default function PenggunaAdminPage() {
  const {
    users = [],
    updateUserRole,
    currentUser,
    isLoaded,
    cleanupDuplicateUsers,
    addUser,
    updateUserData,
    deleteUser,
  } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("semua"); // "semua" | "siswa" | "staf" | "tutor" | "super_admin"
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [isCleanupModalOpen, setIsCleanupModalOpen] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);

  // State Modal Tambah Pengguna
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserData, setNewUserData] = useState({
    nama: "",
    email: "",
    role: "siswa",
    telepon: "",
    sekolah: "",
  });

  // State Modal Edit Pengguna
  const [editingUser, setEditingUser] = useState(null);
  const [isEditingUser, setIsEditingUser] = useState(false);

  // State Modal Hapus Pengguna
  const [deletingUser, setDeletingUser] = useState(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  const handleRunCleanup = async () => {
    setIsCleaning(true);
    try {
      await cleanupDuplicateUsers();
      setIsCleanupModalOpen(false);
    } finally {
      setIsCleaning(false);
    }
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    if (!newUserData.nama.trim() || !newUserData.email.trim()) return;

    setIsAddingUser(true);
    try {
      const res = await addUser(newUserData);
      if (res) {
        setIsAddModalOpen(false);
        setNewUserData({
          nama: "",
          email: "",
          role: "siswa",
          telepon: "",
          sekolah: "",
        });
      }
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsEditingUser(true);
    try {
      const res = await updateUserData(editingUser.id, {
        nama: editingUser.nama,
        email: editingUser.email,
        role: editingUser.role,
        telepon: editingUser.telepon,
        sekolah: editingUser.sekolah,
        aktif: editingUser.aktif !== false,
      });
      if (res) {
        setEditingUser(null);
      }
    } finally {
      setIsEditingUser(false);
    }
  };

  const handleDeleteUserConfirm = async () => {
    if (!deletingUser) return;

    setIsDeletingUser(true);
    try {
      const res = await deleteUser(deletingUser.id);
      if (res) {
        setDeletingUser(null);
      }
    } finally {
      setIsDeletingUser(false);
    }
  };

  const safeUsers = Array.isArray(users) ? users : [];

  const filteredUsers = safeUsers.filter((u) => {
    const nama = u?.nama || "";
    const email = u?.email || "";
    const telepon = u?.telepon || "";
    const role = u?.role || "siswa";

    const matchesSearch =
      nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      telepon.includes(searchQuery);

    const matchesRole = roleFilter === "semua" || role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingUserId(userId);
    try {
      await updateUserRole(userId, newRole);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "siswa":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20">
            Siswa
          </span>
        );
      case "staf":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
            Staf Admisi
          </span>
        );
      case "tutor":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20">
            Tutor
          </span>
        );
      case "super_admin":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20">
            Super Admin
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-600/20">
            {role}
          </span>
        );
    }
  };

  return (
    <DashboardLayout
      title="Manajemen Pengguna & Hak Akses"
      subtitle="Koleksi users di Cloud Firestore: Kelola profil akun dan tetapkan hak akses (role) pengguna secara real-time."
      action={
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs active:scale-95 duration-150 transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Tambah Pengguna Baru</span>
          </button>
          <button
            onClick={() => setIsCleanupModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 font-semibold text-xs shadow-xs active:scale-95 duration-150 transition-all"
            title="Audit dan bersihkan akun duplikat atau tiruan"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Audit & Cleanup</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Search & Filter Header Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/60 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, email, atau telepon..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/60 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-[#F2F2F7]/80 rounded-2xl overflow-x-auto border border-slate-200/60">
            <button
              onClick={() => setRoleFilter("semua")}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 active:scale-95 duration-150 ${
                roleFilter === "semua"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Semua ({safeUsers.length})
            </button>
            <button
              onClick={() => setRoleFilter("siswa")}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 active:scale-95 duration-150 ${
                roleFilter === "siswa"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Siswa ({safeUsers.filter((u) => u?.role === "siswa").length})
            </button>
            <button
              onClick={() => setRoleFilter("staf")}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 active:scale-95 duration-150 ${
                roleFilter === "staf"
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Staf ({safeUsers.filter((u) => u?.role === "staf").length})
            </button>
            <button
              onClick={() => setRoleFilter("tutor")}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 active:scale-95 duration-150 ${
                roleFilter === "tutor"
                  ? "bg-white text-purple-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Tutor ({safeUsers.filter((u) => u?.role === "tutor").length})
            </button>
            <button
              onClick={() => setRoleFilter("super_admin")}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 active:scale-95 duration-150 ${
                roleFilter === "super_admin"
                  ? "bg-white text-rose-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Admin ({safeUsers.filter((u) => u?.role === "super_admin").length})
            </button>
          </div>
        </div>

        {/* Tabel Interaktif Manajemen Pengguna & Ubah Role */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/60 bg-white shadow-xs">
          {!isLoaded ? (
            <div className="p-6 space-y-4 animate-pulse">
              <div className="h-10 bg-slate-100 rounded-xl" />
              <div className="h-14 bg-slate-100 rounded-xl" />
              <div className="h-14 bg-slate-100 rounded-xl" />
              <div className="h-14 bg-slate-100 rounded-xl" />
              <div className="h-14 bg-slate-100 rounded-xl" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-10">
              <EmptyState
                title="Tidak Ada Pengguna Ditemukan"
                description="Tidak ada profil pengguna yang cocok dengan kriteria filter pencarian."
                actionLabel="Reset Pencarian"
                onAction={() => {
                  setSearchQuery("");
                  setRoleFilter("semua");
                }}
              />
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 text-slate-500 uppercase text-[11px] font-semibold tracking-wider px-6 py-4 border-b border-slate-200/60">
                <tr>
                  <th className="px-6 py-4">Pengguna</th>
                  <th className="px-6 py-4">Kontak</th>
                  <th className="px-6 py-4">Instansi / Asal</th>
                  <th className="px-6 py-4">Status & Peran</th>
                  <th className="px-6 py-4 text-right">Aksi Manajemen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  const isUpdating = updatingUserId === u.id;
                  const isAktif = u.aktif !== false;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                              {u.avatar || u.nama?.slice(0, 2).toUpperCase() || "US"}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                                <span>{u.nama || "Tanpa Nama"}</span>
                                {isSelf && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20 font-medium">
                                    Anda
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono truncate max-w-[200px]">
                                UID: {u.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-slate-900 font-medium">{u.email}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{u.telepon || u.noHp || "-"}</div>
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {u.sekolah || u.divisi || u.bidang || "Bimbel Langkah Juara"}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            {getRoleBadge(u.role || "siswa")}
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isAktif
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                  : "bg-rose-50 text-rose-700 border border-rose-200/60"
                              }`}
                            >
                              {isAktif ? "Aktif" : "Nonaktif"}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isUpdating ? (
                              <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Menyimpan...</span>
                              </div>
                            ) : (
                              <select
                                value={u.role || "siswa"}
                                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                className="rounded-xl border border-slate-200/80 px-2.5 py-1.5 text-xs font-semibold text-slate-800 bg-[#F2F2F7]/60 hover:bg-[#F2F2F7] focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer shadow-xs"
                                title="Ubah Peran Secara Cepat"
                              >
                                <option value="siswa">siswa</option>
                                <option value="staf">staf</option>
                                <option value="tutor">tutor</option>
                                <option value="super_admin">super_admin</option>
                              </select>
                            )}

                            <button
                              onClick={() => setEditingUser(u)}
                              className="p-1.5 rounded-xl border border-slate-200/80 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors shadow-xs"
                              title="Edit Detail Pengguna"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setDeletingUser(u)}
                              disabled={isSelf}
                              className={`p-1.5 rounded-xl border transition-colors shadow-xs ${
                                isSelf
                                  ? "border-slate-200 text-slate-300 cursor-not-allowed"
                                  : "border-slate-200/80 text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200"
                              }`}
                              title={isSelf ? "Tidak dapat menghapus akun Anda sendiri" : "Hapus Akun Pengguna"}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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

      {/* Modal Konfirmasi & Audit Pembersihan Database */}
      {isCleanupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-lg w-full p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Audit & Pembersihan Database
                  </h3>
                  <p className="text-xs text-slate-500">
                    Koleksi Cloud Firestore: users, kelas, pendaftaran
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCleanupModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-900 block mb-0.5">
                    Ketentuan Penghapusan Aman
                  </span>
                  Sistem akan mengidentifikasi seluruh akun tiruan / duplikat dan menyisakan tepat 1 akun resmi untuk masing-masing 4 peran resmi PRD. Seluruh relasi data kelas dan tugas akan diselaraskan otomatis sehingga terbebas dari broken reference.
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-800 block">
                  4 Akun Resmi yang Dipertahankan:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-[#F2F2F7]/70 border border-slate-200/60">
                    <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">Super Admin</span>
                    <span className="font-semibold text-slate-900 block truncate">Pak Arif Super Admin</span>
                    <span className="text-[11px] text-slate-500 truncate block">admin@langkahjuara.id</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F2F2F7]/70 border border-slate-200/60">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Staf Admisi</span>
                    <span className="font-semibold text-slate-900 block truncate">Dian Staf Admisi</span>
                    <span className="text-[11px] text-slate-500 truncate block">staf@langkahjuara.id</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F2F2F7]/70 border border-slate-200/60">
                    <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">Tutor Pendidik</span>
                    <span className="font-semibold text-slate-900 block truncate">Hendra Tutor Pendidik</span>
                    <span className="text-[11px] text-slate-500 truncate block">tutor@langkahjuara.id</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F2F2F7]/70 border border-slate-200/60">
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Siswa Bimbingan</span>
                    <span className="font-semibold text-slate-900 block truncate">Ahmad Alwahyu Pradana</span>
                    <span className="text-[11px] text-slate-500 truncate block">siswa@langkahjuara.id</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200/60 flex items-center gap-2 text-blue-800">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Saat ini terdeteksi <strong>{safeUsers.length}</strong> akun terdaftar di koleksi users.</span>
              </div>
            </div>

            <div className="pt-5 mt-6 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCleanupModalOpen(false)}
                disabled={isCleaning}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleRunCleanup}
                disabled={isCleaning}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition-all active:scale-95 duration-150 disabled:opacity-50"
              >
                {isCleaning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Membersihkan...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Jalankan Pembersihan Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Pengguna Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-lg w-full p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/60">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Tambah Pengguna Baru
                  </h3>
                  <p className="text-xs text-slate-500">
                    Membuat akun dokumen baru di koleksi users Cloud Firestore
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newUserData.nama}
                  onChange={(e) => setNewUserData({ ...newUserData, nama: e.target.value })}
                  placeholder="Contoh: Muhammad Farhan"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/80 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Alamat Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  placeholder="farhan@langkahjuara.id"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/80 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Peran (Role Sistem) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newUserData.role}
                    onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/80 text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-xs"
                  >
                    <option value="siswa">Siswa (Akses Belajar)</option>
                    <option value="staf">Staf (Admisi & Kelas)</option>
                    <option value="tutor">Tutor (Pengajar & Grading)</option>
                    <option value="super_admin">Super Admin (Akses Penuh)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    value={newUserData.telepon}
                    onChange={(e) => setNewUserData({ ...newUserData, telepon: e.target.value })}
                    placeholder="081234567890"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/80 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Asal Sekolah / Instansi / Divisi
                </label>
                <input
                  type="text"
                  value={newUserData.sekolah}
                  onChange={(e) => setNewUserData({ ...newUserData, sekolah: e.target.value })}
                  placeholder="Contoh: SMA Negeri 8 Jakarta atau Divisi Kurikulum"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/80 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isAddingUser}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isAddingUser}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all active:scale-95 duration-150 disabled:opacity-50"
                >
                  {isAddingUser ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Simpan Pengguna</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Data Pengguna */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-lg w-full p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200/60">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Edit Data Pengguna
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    UID: {editingUser.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditUserSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingUser.nama || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, nama: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/80 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Alamat Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={editingUser.email || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/80 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Peran (Role)
                  </label>
                  <select
                    value={editingUser.role || "siswa"}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/80 text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-xs"
                  >
                    <option value="siswa">Siswa</option>
                    <option value="staf">Staf Admisi</option>
                    <option value="tutor">Tutor</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Status Akun
                  </label>
                  <select
                    value={editingUser.aktif !== false ? "aktif" : "nonaktif"}
                    onChange={(e) => setEditingUser({ ...editingUser, aktif: e.target.value === "aktif" })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/80 text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-xs"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif (Diblokir)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nomor WhatsApp / HP
                </label>
                <input
                  type="text"
                  value={editingUser.telepon || editingUser.noHp || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, telepon: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/80 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Asal Sekolah / Instansi / Divisi
                </label>
                <input
                  type="text"
                  value={editingUser.sekolah || editingUser.divisi || editingUser.bidang || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, sekolah: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/80 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  disabled={isEditingUser}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isEditingUser}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-xs transition-all active:scale-95 duration-150 disabled:opacity-50"
                >
                  {isEditingUser ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Perbarui Data</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Pengguna */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-md w-full p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-600 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200/60 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Hapus Akun Pengguna
                </h3>
                <p className="text-xs text-slate-500">
                  Tindakan ini permanen di Cloud Firestore.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F2F2F7]/70 border border-slate-200/60 text-xs space-y-1 mb-5">
              <div className="font-bold text-slate-900">{deletingUser.nama || "Tanpa Nama"}</div>
              <div className="text-slate-600 font-mono text-[11px]">{deletingUser.email}</div>
              <div className="text-[10px] font-semibold text-rose-700 uppercase">Peran: {deletingUser.role || "siswa"}</div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                disabled={isDeletingUser}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteUserConfirm}
                disabled={isDeletingUser}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition-all active:scale-95 duration-150 disabled:opacity-50"
              >
                {isDeletingUser ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus Pengguna</span>
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
