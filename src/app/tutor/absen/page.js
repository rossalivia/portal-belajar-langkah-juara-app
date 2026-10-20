"use client";

import React, { useState } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import StatCard from "../../../components/StatCard";
import EmptyState from "../../../components/EmptyState";
import { useData } from "../../../context/DataContext";
import { formatDateOnly, formatDateTime } from "../../../lib/dateUtils";
import {
  CalendarCheck,
  Building2,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Save,
  Loader2,
  History,
  Check,
  UserCheck,
} from "lucide-react";

export default function PresensiTutorPage() {
  const {
    isLoaded,
    currentUser,
    kelas = [],
    users = [],
    presensi = [],
    recordPresensi,
  } = useData();

  const safeKelas = Array.isArray(kelas) ? kelas : [];
  const safeUsers = Array.isArray(users) ? users : [];
  const safePresensi = Array.isArray(presensi) ? presensi : [];

  // Kelas yang diampu oleh tutor aktif (atau seluruh kelas jika super_admin)
  const isSuperAdmin = currentUser?.role === "super_admin" || currentUser?.role === "admin";
  const myKelas = isSuperAdmin
    ? safeKelas
    : safeKelas.filter((k) => k?.tutorId === currentUser?.id);

  const [selectedKelasId, setSelectedKelasId] = useState("");
  const activeKelas = myKelas.find((k) => k.id === selectedKelasId) || myKelas[0];
  const activeKelasId = activeKelas?.id || "";

  // Tanggal sesi hari ini (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split("T")[0];
  const [sessionDate, setSessionDate] = useState(todayStr);

  // Siswa dalam kelas terpilih
  const siswaInClass = (activeKelas?.siswaIds || [])
    .map((sId) => safeUsers.find((u) => u.id === sId))
    .filter(Boolean);

  // State kehadiran siswa untuk sesi saat ini: { [siswaId]: "hadir" | "izin" | "alpa" }
  const [attendanceMap, setAttendanceMap] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getStatus = (siswaId) => attendanceMap[siswaId] || "hadir";

  const handleSetStatus = (siswaId, status) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [siswaId]: status,
    }));
  };

  const handleMarkAllHadir = () => {
    const updated = {};
    siswaInClass.forEach((s) => {
      updated[s.id] = "hadir";
    });
    setAttendanceMap(updated);
  };

  const handleSubmitPresensi = async (e) => {
    e.preventDefault();
    if (!activeKelasId) return;

    if (siswaInClass.length === 0) {
      alert("Tidak ada siswa terdaftar dalam kelas ini untuk diabsen.");
      return;
    }

    setIsSubmitting(true);
    try {
      const daftarHadir = siswaInClass.map((s) => ({
        siswaId: s.id,
        nama: s.nama || "Siswa",
        status: getStatus(s.id),
      }));

      await recordPresensi({
        kelasId: activeKelasId,
        tanggal: sessionDate,
        daftarHadir,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Riwayat presensi untuk kelas terpilih
  const classHistory = safePresensi
    .filter((p) => p.kelasId === activeKelasId)
    .sort((a, b) => new Date(b.tanggal || b.createdAt) - new Date(a.tanggal || a.createdAt));

  // Metrik Agregat Kehadiran Kelas
  const totalSessions = classHistory.length;
  let totalHadirCount = 0;
  let totalRecords = 0;

  classHistory.forEach((sess) => {
    (sess.daftarHadir || []).forEach((rec) => {
      totalRecords += 1;
      if (rec.status === "hadir") totalHadirCount += 1;
    });
  });

  const avgAttendanceRate =
    totalRecords > 0 ? Math.round((totalHadirCount / totalRecords) * 100) : 100;

  return (
    <DashboardLayout
      title="Presensi Kehadiran Belajar"
      subtitle="Buka sesi pertemuan, catat status kehadiran siswa (Hadir / Izin / Alpa), dan pantau riwayat keaktifan kelas."
    >
      <div className="space-y-6">
        {!isLoaded ? (
          <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="h-28 bg-slate-200/70 rounded-xl" />
              <div className="h-28 bg-slate-200/70 rounded-xl" />
              <div className="h-28 bg-slate-200/70 rounded-xl" />
            </div>
            <div className="h-96 bg-slate-200/70 rounded-xl" />
          </div>
        ) : myKelas.length === 0 ? (
          <EmptyState
            title="Belum Memiliki Kelas Bimbingan"
            description="Anda belum ditugaskan sebagai tutor pengampu pada rombongan belajar manapun. Hubungi staf admisi untuk penempatan kelas."
            icon={Building2}
          />
        ) : (
          <>
            {/* Metrik Kehadiran Kelas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                title="Kelas Bimbingan"
                value={activeKelas?.nama || "Pilih Kelas"}
                subtitle={`${siswaInClass.length} siswa terdaftar aktif`}
                icon={Building2}
                color="purple"
              />
              <StatCard
                title="Sesi Presensi Tercatat"
                value={totalSessions}
                subtitle="Pertemuan belajar telah diabsen"
                icon={CalendarCheck}
                color="sky"
              />
              <StatCard
                title="Rata-rata Kehadiran"
                value={`${avgAttendanceRate}%`}
                subtitle={`Dari total ${totalRecords} catatan kehadiran`}
                icon={CheckCircle2}
                color="emerald"
                trend={avgAttendanceRate >= 80 ? "Disiplin Tinggi" : undefined}
              />
            </div>

            {/* Pilihan Rombongan Belajar (Tab Selector) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2.5">
                  Pilih Rombongan Belajar
                </span>
                <div className="flex flex-wrap gap-2">
                  {myKelas.map((k) => (
                    <button
                      key={k.id}
                      type="button"
                      onClick={() => {
                        setSelectedKelasId(k.id);
                        setAttendanceMap({});
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 duration-150 ${
                        activeKelasId === k.id
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-[#F2F2F7] text-slate-700 hover:bg-slate-200/80 border border-slate-200/50"
                      }`}
                    >
                      {k.nama}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <label className="text-xs font-semibold text-slate-600 shrink-0">
                  Tanggal Sesi:
                </label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/60 text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Form Lembar Presensi Siswa */}
            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xs overflow-hidden">
              <div className="p-6 sm:p-7 border-b border-slate-200/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-slate-900">
                    Lembar Absensi: {activeKelas?.nama}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Tanggal pertemuan: <strong>{formatDateOnly(sessionDate)}</strong> &bull; Total {siswaInClass.length} siswa
                  </p>
                </div>
                {siswaInClass.length > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllHadir}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60 text-xs font-semibold active:scale-95 duration-150 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Tandai Semua Hadir</span>
                  </button>
                )}
              </div>

              {siswaInClass.length === 0 ? (
                <div className="p-10">
                  <EmptyState
                    title="Belum Ada Siswa di Kelas Ini"
                    description="Belum ada siswa yang dialokasikan ke dalam rombongan belajar ini oleh staf admisi."
                    icon={Users}
                  />
                </div>
              ) : (
                <form onSubmit={handleSubmitPresensi}>
                  <div className="overflow-x-auto rounded-2xl border-x-0 border-t-0 border-slate-200/60">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/70 border-b border-slate-200/60 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
                        <tr>
                          <th className="px-6 py-4">No</th>
                          <th className="px-6 py-4">Nama Siswa</th>
                          <th className="px-6 py-4">Kontak / Email</th>
                          <th className="px-6 py-4 text-center">Status Kehadiran</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {siswaInClass.map((siswa, idx) => {
                          const status = getStatus(siswa.id);
                          return (
                            <tr key={siswa.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4 text-slate-400 font-mono">
                                {idx + 1}
                              </td>
                              <td className="px-6 py-4">
                                <div className="font-semibold text-slate-900">
                                  {siswa.nama || "Siswa"}
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  {siswa.sekolah || "Bimbel Langkah Juara"}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-slate-600">
                                <div>{siswa.email}</div>
                                <div className="text-[11px] text-slate-400">{siswa.telepon || "-"}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleSetStatus(siswa.id, "hadir")}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold active:scale-95 duration-150 transition-all ${
                                      status === "hadir"
                                        ? "bg-emerald-600 text-white shadow-xs"
                                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60"
                                    }`}
                                  >
                                    Hadir
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSetStatus(siswa.id, "izin")}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold active:scale-95 duration-150 transition-all ${
                                      status === "izin"
                                        ? "bg-amber-600 text-white shadow-xs"
                                        : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/60"
                                    }`}
                                  >
                                    Izin
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSetStatus(siswa.id, "alpa")}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold active:scale-95 duration-150 transition-all ${
                                      status === "alpa"
                                        ? "bg-rose-600 text-white shadow-xs"
                                        : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60"
                                    }`}
                                  >
                                    Alpa
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-6 bg-[#F2F2F7]/50 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-slate-500">
                      Tercatat:{" "}
                      <span className="font-semibold text-emerald-700">
                        {siswaInClass.filter((s) => getStatus(s.id) === "hadir").length} Hadir
                      </span>
                      {" &bull; "}
                      <span className="font-semibold text-amber-700">
                        {siswaInClass.filter((s) => getStatus(s.id) === "izin").length} Izin
                      </span>
                      {" &bull; "}
                      <span className="font-semibold text-rose-700">
                        {siswaInClass.filter((s) => getStatus(s.id) === "alpa").length} Alpa
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs active:scale-95 duration-150 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Menyimpan ke Firestore...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Simpan Presensi Kelas</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Riwayat Sesi Presensi Terdahulu */}
            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xs overflow-hidden">
              <div className="p-6 sm:p-7 border-b border-slate-200/60 flex items-center gap-2.5">
                <History className="w-4 h-4 text-slate-400" />
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Riwayat Pertemuan & Presensi Tercatat ({classHistory.length})
                </h3>
              </div>

              {classHistory.length === 0 ? (
                <div className="p-8">
                  <EmptyState
                    title="Belum Ada Riwayat Presensi"
                    description="Belum ada sesi absensi yang disimpan untuk kelas bimbingan ini."
                    icon={CalendarCheck}
                  />
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {classHistory.map((sess) => {
                    const daftar = sess.daftarHadir || [];
                    const hCount = daftar.filter((d) => d.status === "hadir").length;
                    const iCount = daftar.filter((d) => d.status === "izin").length;
                    const aCount = daftar.filter((d) => d.status === "alpa").length;

                    return (
                      <div
                        key={sess.id}
                        className="p-5 sm:p-6 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2.5">
                            <span className="text-sm font-bold text-slate-900">
                              {formatDateOnly(sess.tanggal)}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              ID: {sess.id.slice(0, 8)}...
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                              {hCount} Hadir
                            </span>
                            <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                              {iCount} Izin
                            </span>
                            <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/60">
                              {aCount} Alpa
                            </span>
                          </div>
                        </div>

                        <div className="text-right text-xs text-slate-500 font-medium">
                          Total {daftar.length} siswa diabsen
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
    </DashboardLayout>
  );
}
