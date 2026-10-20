"use client";

import React, { useState } from "react";
import Link from "next/link";
import DashboardLayout from "../../../components/DashboardLayout";
import StatCard from "../../../components/StatCard";
import EmptyState from "../../../components/EmptyState";
import { useData } from "../../../context/DataContext";
import { formatDateOnly } from "../../../lib/dateUtils";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  XCircle,
  Building2,
  Award,
  BookOpen,
  ArrowRight,
  Filter,
} from "lucide-react";

export default function RekapPresensiSiswaPage() {
  const {
    isLoaded,
    currentUser,
    kelas = [],
    users = [],
    presensi = [],
  } = useData();

  const safeKelas = Array.isArray(kelas) ? kelas : [];
  const safeUsers = Array.isArray(users) ? users : [];
  const safePresensi = Array.isArray(presensi) ? presensi : [];

  // Kelas-kelas di mana siswa terdaftar
  const myKelas = safeKelas.filter((k) => k?.siswaIds?.includes(currentUser?.id));
  const myKelasIds = myKelas.map((k) => k.id);

  const [selectedKelasFilter, setSelectedKelasFilter] = useState("semua");

  // Filter rekaman presensi yang relevan dengan kelas siswa
  const relevantPresensi = safePresensi
    .filter((p) => myKelasIds.includes(p.kelasId))
    .filter((p) => selectedKelasFilter === "semua" || p.kelasId === selectedKelasFilter)
    .sort((a, b) => new Date(b.tanggal || b.createdAt) - new Date(a.tanggal || a.createdAt));

  // Ekstrak data kehadiran siswa aktif dari setiap sesi pertemuan
  const studentRecords = [];
  relevantPresensi.forEach((sess) => {
    const record = (sess.daftarHadir || []).find((d) => d.siswaId === currentUser?.id);
    if (record) {
      const kl = safeKelas.find((k) => k.id === sess.kelasId);
      const tutor = safeUsers.find((u) => u.id === sess.tutorId || u.id === kl?.tutorId);
      studentRecords.push({
        id: sess.id,
        tanggal: sess.tanggal,
        kelasNama: kl?.nama || "Kelas Bimbingan",
        tutorNama: tutor?.nama || "Tutor Pengampu",
        status: record.status || "hadir",
      });
    }
  });

  const totalSessions = studentRecords.length;
  const hadirCount = studentRecords.filter((r) => r.status === "hadir").length;
  const izinCount = studentRecords.filter((r) => r.status === "izin").length;
  const alpaCount = studentRecords.filter((r) => r.status === "alpa").length;

  const attendancePercentage =
    totalSessions > 0 ? Math.round((hadirCount / totalSessions) * 100) : 100;

  const getStatusBadge = (status) => {
    switch (status) {
      case "hadir":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>HADIR</span>
          </span>
        );
      case "izin":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
            <Clock className="w-3.5 h-3.5" />
            <span>IZIN</span>
          </span>
        );
      case "alpa":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/60">
            <XCircle className="w-3.5 h-3.5" />
            <span>ALPA</span>
          </span>
        );
    }
  };

  return (
    <DashboardLayout
      title="Rekap Kehadiran Belajar"
      subtitle="Pantau transparansi tingkat kehadiran bimbingan tatap muka dan online Anda di setiap rombongan belajar."
      action={
        <Link
          href="/beranda/tugas"
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition-all flex items-center gap-1.5"
        >
          <span>Buka Tugas Belajar</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      }
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
            <div className="h-80 bg-slate-200/70 rounded-xl" />
          </div>
        ) : myKelasIds.length === 0 ? (
          <EmptyState
            title="Belum Terdaftar di Kelas Bimbingan"
            description="Anda belum dialokasikan ke dalam rombongan belajar manapun. Silakan ajukan program bimbel dan tunggu konfirmasi penempatan kelas."
            icon={BookOpen}
            actionLabel="Ajukan Program Bimbel"
            actionHref="/beranda/program"
          />
        ) : (
          <>
            {/* Metrik Statistik Kehadiran Siswa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Tingkat Kehadiran"
                value={`${attendancePercentage}%`}
                subtitle={`Dari ${totalSessions} sesi pertemuan berlangsung`}
                icon={Award}
                color="purple"
                trend={
                  attendancePercentage >= 85
                    ? "Sangat Rajin"
                    : attendancePercentage >= 70
                    ? "Cukup Baik"
                    : "Perlu Ditingkatkan"
                }
              />
              <StatCard
                title="Total Hadir"
                value={hadirCount}
                subtitle="Pertemuan diikuti penuh"
                icon={CheckCircle2}
                color="emerald"
              />
              <StatCard
                title="Izin / Dispensasi"
                value={izinCount}
                subtitle="Pemberitahuan terkonfirmasi"
                icon={Clock}
                color="amber"
              />
              <StatCard
                title="Alpa / Tanpa Keterangan"
                value={alpaCount}
                subtitle="Pertemuan terlewat"
                icon={XCircle}
                color="rose"
              />
            </div>

            {/* Filter Rombongan Belajar jika ikut lebih dari 1 kelas */}
            {myKelas.length > 1 && (
              <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-700">Filter Kelas:</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto">
                  <button
                    onClick={() => setSelectedKelasFilter("semua")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold active:scale-95 duration-150 transition-all ${
                      selectedKelasFilter === "semua"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-[#F2F2F7] text-slate-600 hover:bg-slate-200/80 border border-slate-200/50"
                    }`}
                  >
                    Semua ({myKelas.length} Kelas)
                  </button>
                  {myKelas.map((k) => (
                    <button
                      key={k.id}
                      onClick={() => setSelectedKelasFilter(k.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold active:scale-95 duration-150 transition-all ${
                        selectedKelasFilter === k.id
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-[#F2F2F7] text-slate-600 hover:bg-slate-200/80 border border-slate-200/50"
                      }`}
                    >
                      {k.nama}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tabel Catatan Presensi Siswa */}
            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xs overflow-hidden">
              <div className="p-6 sm:p-7 border-b border-slate-200/60 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-slate-900">
                    Log Catatan Kehadiran Pertemuan
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Riwayat data presensi yang diinput langsung oleh tutor pengampu bimbingan.
                  </p>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F2F2F7] text-slate-700 border border-slate-200/50">
                  {totalSessions} Sesi
                </span>
              </div>

              {studentRecords.length === 0 ? (
                <div className="p-10">
                  <EmptyState
                    title="Belum Ada Rekaman Presensi"
                    description="Tutor belum membuka atau mencatat sesi presensi untuk rombongan belajar Anda."
                    icon={CalendarCheck}
                  />
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border-x-0 border-t-0 border-slate-200/60">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/70 border-b border-slate-200/60 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Tanggal Pertemuan</th>
                        <th className="px-6 py-4">Rombongan Belajar</th>
                        <th className="px-6 py-4">Tutor Pengampu</th>
                        <th className="px-6 py-4 text-center">Status Kehadiran</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentRecords.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-mono font-medium text-slate-900">
                            {formatDateOnly(item.tanggal)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900">{item.kelasNama}</div>
                            <div className="text-[11px] text-slate-400">Bimbel Langkah Juara</div>
                          </td>
                          <td className="px-6 py-4 text-slate-700 font-medium">
                            {item.tutorNama}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {getStatusBadge(item.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
