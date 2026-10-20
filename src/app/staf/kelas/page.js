"use client";

import React, { useState } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import EmptyState from "../../../components/EmptyState";
import { useData } from "../../../context/DataContext";
import {
  Building2,
  Users,
  UserPlus,
  Trash2,
  CheckCircle2,
  User,
  GraduationCap,
  Calendar,
  AlertCircle,
  Clock,
  Loader2,
  ShieldCheck,
  Save,
} from "lucide-react";

export default function PenempatanKelasPage() {
  const {
    isLoaded,
    kelas = [],
    users = [],
    pendaftaran = [],
    program = [],
    assignSiswaKelas,
    removeSiswaFromKelas,
    updateKelasTutor,
  } = useData();

  const safeKelas = Array.isArray(kelas) ? kelas : [];
  const safeUsers = Array.isArray(users) ? users : [];
  const safePendaftaran = Array.isArray(pendaftaran) ? pendaftaran : [];
  const safeProgram = Array.isArray(program) ? program : [];

  const [selectedKelasId, setSelectedKelasId] = useState("");
  const [selectedSiswaId, setSelectedSiswaId] = useState("");
  const [selectedTutorId, setSelectedTutorId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUpdatingTutor, setIsUpdatingTutor] = useState(false);

  // Kelas yang sedang aktif dipilih
  const currentKelas = safeKelas.find((k) => k.id === selectedKelasId) || safeKelas[0];
  const activeKelasId = currentKelas?.id || "";
  const currentTutor = safeUsers.find((u) => u.id === currentKelas?.tutorId);

  // Daftar seluruh tutor yang tersedia di sistem
  const availableTutors = safeUsers.filter(
    (u) => u.role === "tutor" || u.role === "super_admin"
  );

  // Program yang sesuai dengan kelas terpilih
  const kelasProgramId =
    currentKelas?.programId ||
    (currentKelas?.nama?.toLowerCase().includes("snbt")
      ? "prog-1"
      : currentKelas?.nama?.toLowerCase().includes("kedinasan")
      ? "prog-2"
      : "prog-1");
  const currentProgram = safeProgram.find((p) => p.id === kelasProgramId);

  // Siswa yang sudah terdaftar di kelas terpilih
  const currentSiswaIds = Array.isArray(currentKelas?.siswaIds) ? currentKelas.siswaIds : [];
  const studentsInCurrentKelas = safeUsers.filter((u) =>
    currentSiswaIds.includes(u.id)
  );

  // Filter siswa yang memiliki pendaftaran berstatus 'disetujui' atau 'aktif'
  const approvedPendaftaran = safePendaftaran.filter((p) => {
    return p.status === "disetujui" || p.status === "aktif";
  });

  const eligibleSiswaIds = [
    ...new Set(approvedPendaftaran.map((p) => p.siswaId)),
  ];

  // Siswa yang berstatus disetujui tapi belum dimasukkan ke kelas ini
  const eligibleStudentsToAdd = safeUsers.filter(
    (u) => eligibleSiswaIds.includes(u.id) && !currentSiswaIds.includes(u.id)
  );

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedSiswaId || !activeKelasId) return;

    setIsProcessing(true);
    try {
      await assignSiswaKelas(activeKelasId, selectedSiswaId);
      setSelectedSiswaId("");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = async (siswaId) => {
    if (!activeKelasId) return;
    setIsProcessing(true);
    try {
      await removeSiswaFromKelas(activeKelasId, siswaId);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveTutor = async (e) => {
    e.preventDefault();
    if (!activeKelasId || !selectedTutorId) return;

    setIsUpdatingTutor(true);
    try {
      await updateKelasTutor(activeKelasId, selectedTutorId);
    } finally {
      setIsUpdatingTutor(false);
    }
  };

  return (
    <DashboardLayout
      title="Alokasi Penempatan Siswa ke Kelas"
      subtitle="Tempatkan siswa yang telah disetujui ke dalam rombongan belajar dan pastikan tutor pengampu terikat dengan benar."
    >
      <div className="space-y-6">
        {!isLoaded ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-28 bg-slate-200/70 rounded-xl" />
            <div className="h-44 bg-slate-200/70 rounded-xl" />
            <div className="h-64 bg-slate-200/70 rounded-xl" />
          </div>
        ) : (
          <>
            {/* Selector Kelas Bimbingan Tab */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/60 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2.5">
                  Pilih Rombongan Belajar / Kelas
                </span>
                <div className="flex flex-wrap gap-2">
                  {safeKelas.map((k) => (
                    <button
                      key={k.id}
                      onClick={() => {
                        setSelectedKelasId(k.id);
                        setSelectedTutorId("");
                      }}
                      className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95 ${
                        (selectedKelasId || safeKelas[0]?.id) === k.id
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-[#F2F2F7]/80 text-slate-700 hover:bg-[#F2F2F7] border border-slate-200/60"
                      }`}
                    >
                      {k.nama}
                    </button>
                  ))}
                </div>
              </div>

              {currentKelas && (
                <div className="text-left sm:text-right sm:border-l sm:border-slate-200/60 sm:pl-6 w-full sm:w-auto">
                  <div className="text-sm font-bold text-slate-900">{currentKelas.nama}</div>
                  <div className="inline-block mt-1 px-3 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                    Program: {currentProgram?.nama || "Program Bimbel"}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Tutor Aktif: <strong className="text-slate-800">{currentTutor?.nama || "Belum ditentukan"}</strong> &bull; Kapasitas: {studentsInCurrentKelas.length}/{currentKelas.kuotaMaks || 20}
                  </div>
                </div>
              )}
            </div>

            {/* Panel Pengaturan Tutor Pengampu (Memastikan tutorId Terikat dengan Benar) */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/60 shadow-xs">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Pastikan Tutor Pengampu Terikat pada Kelas Ini
                </h2>
              </div>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Pilih tenaga pendidik dari koleksi pengguna role <strong>tutor</strong> untuk mengampu kelas <strong>{currentKelas?.nama}</strong>.
              </p>

              <form onSubmit={handleSaveTutor} className="flex flex-col sm:flex-row gap-3">
                <select
                  value={selectedTutorId || currentKelas?.tutorId || ""}
                  onChange={(e) => setSelectedTutorId(e.target.value)}
                  disabled={isUpdatingTutor}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/60 text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer"
                >
                  <option value="">-- Pilih Tutor Pengampu --</option>
                  {availableTutors.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nama} ({t.email}) {t.id === currentKelas?.tutorId ? "— [Tutor Aktif Saat Ini]" : ""}
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  disabled={isUpdatingTutor || (!selectedTutorId && !currentKelas?.tutorId)}
                  className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all active:scale-95 duration-150 focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 flex items-center justify-center gap-2 shrink-0 disabled:opacity-40"
                >
                  {isUpdatingTutor ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan Tutor...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Simpan Tutor Pengampu</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Form Tambah Siswa ke Kelas */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/60 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                Alokasikan Siswa Terverifikasi ke Kelas Ini
              </h2>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Siswa yang telah <strong>DISETUJUI</strong> oleh staf dapat langsung dialokasikan ke dalam array <code>siswaIds</code> kelas ini.
              </p>

              <form onSubmit={handleAssign} className="flex flex-col sm:flex-row gap-3">
                <select
                  value={selectedSiswaId}
                  onChange={(e) => setSelectedSiswaId(e.target.value)}
                  disabled={isProcessing || eligibleStudentsToAdd.length === 0}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/60 text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">
                    {eligibleStudentsToAdd.length === 0
                      ? "-- Belum ada siswa disetujui yang dapat dialokasikan ke kelas ini --"
                      : `-- Pilih siswa untuk dimasukkan (${eligibleStudentsToAdd.length} siswa siap dialokasi) --`}
                  </option>
                  {eligibleStudentsToAdd.map((s) => {
                    const studentPendaftaran = approvedPendaftaran.find((p) => p.siswaId === s.id);
                    const prog = safeProgram.find((pr) => pr.id === studentPendaftaran?.programId);
                    return (
                      <option key={s.id} value={s.id}>
                        {s.nama} ({s.email}) &bull; Sekolah: {s.sekolah || "-"} [Program: {prog?.nama || "Bimbel"}]
                      </option>
                    );
                  })}
                </select>

                <button
                  type="submit"
                  disabled={!selectedSiswaId || isProcessing}
                  className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all active:scale-95 duration-150 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center gap-2 shrink-0 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Tambahkan Siswa ke Kelas</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Tabel Daftar Siswa di Kelas Ini */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200/60 bg-white shadow-xs">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Daftar Siswa dalam Rombongan Belajar Ini
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Total {studentsInCurrentKelas.length} siswa aktif terdaftar di {currentKelas?.nama}.
                  </p>
                </div>
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
                  {studentsInCurrentKelas.length} Siswa Terdaftar
                </span>
              </div>

              {studentsInCurrentKelas.length === 0 ? (
                <div className="p-8">
                  <EmptyState
                    title="Kelas Masih Kosong"
                    description="Belum ada siswa yang dialokasikan ke kelas bimbingan ini. Gunakan formulir di atas untuk menambahkan siswa."
                    icon={Users}
                  />
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/70 text-slate-500 uppercase text-[11px] font-semibold tracking-wider px-6 py-4 border-b border-slate-200/60">
                    <tr>
                      <th className="px-6 py-4">Nama Siswa</th>
                      <th className="px-6 py-4">Asal Sekolah</th>
                      <th className="px-6 py-4">Kontak Siswa</th>
                      <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentsInCurrentKelas.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{s.nama}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">ID: {s.id}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-medium">
                          {s.sekolah || "-"}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          <div>{s.email}</div>
                          <div className="text-[11px] text-slate-500">{s.telepon || "-"}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleRemove(s.id)}
                            disabled={isProcessing}
                            className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-all active:scale-95 duration-150"
                            title="Keluarkan dari kelas"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
