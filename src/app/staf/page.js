"use client";

import React from "react";
import Link from "next/link";
import DashboardLayout from "../../components/DashboardLayout";
import StatCard from "../../components/StatCard";
import EmptyState from "../../components/EmptyState";
import { useData } from "../../context/DataContext";
import {
  Users,
  UserCheck,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { formatDateOnly } from "../../lib/dateUtils";

export default function DasborStafPage() {
  const { pendaftaran = [], users = [], program = [], kelas = [], updatePendaftaranStatus, isLoaded } = useData();

  const safePendaftaran = Array.isArray(pendaftaran) ? pendaftaran : [];
  const safeUsers = Array.isArray(users) ? users : [];
  const safeProgram = Array.isArray(program) ? program : [];
  const safeKelas = Array.isArray(kelas) ? kelas : [];

  const totalDaftar = safePendaftaran.length;
  const pendingDaftar = safePendaftaran.filter((p) => p.status === "menunggu");
  const approvedDaftar = safePendaftaran.filter((p) => p.status === "disetujui");
  const rejectedDaftar = safePendaftaran.filter((p) => p.status === "ditolak");

  // Siswa yang disetujui tapi belum dialokasikan ke kelas manapun (aman dari flatMap undefined)
  const assignedSiswaIds = new Set(safeKelas.flatMap((k) => k?.siswaIds || []));
  const unassignedApprovedSiswa = approvedDaftar.filter(
    (p) => !assignedSiswaIds.has(p.siswaId)
  );

  return (
    <DashboardLayout
      title="Dasbor Operasional Staf Admisi"
      subtitle="Analitik pendaftaran aktif, status verifikasi berkas, dan alokasi rombongan belajar."
      action={
        <div className="flex items-center gap-2">
          <Link
            href="/staf/pendaftaran"
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-sm transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-1.5"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Verifikasi Pendaftaran</span>
          </Link>
          <Link
            href="/staf/kelas"
            className="px-4 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs shadow-sm transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Alokasi Kelas</span>
          </Link>
        </div>
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
            <div className="h-72 bg-slate-200/70 rounded-xl" />
          </div>
        ) : (
          <>
            {/* Metrik Analitik Pendaftaran */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Pendaftaran"
                value={totalDaftar}
                subtitle="Seluruh pengajuan siswa"
                icon={Users}
                color="sky"
              />
              <StatCard
                title="Menunggu Review"
                value={pendingDaftar.length}
                subtitle="Perlu diverifikasi staf"
                icon={Clock}
                color="amber"
                trend={pendingDaftar.length > 0 ? "Perlu Ditinjau" : undefined}
              />
              <StatCard
                title="Telah Disetujui"
                value={approvedDaftar.length}
                subtitle={`${unassignedApprovedSiswa.length} belum masuk kelas`}
                icon={CheckCircle2}
                color="emerald"
              />
              <StatCard
                title="Kelas Aktif"
                value={safeKelas.length}
                subtitle="Rombongan belajar berjalan"
                icon={Building2}
                color="purple"
              />
            </div>

            {/* Tabel Ringkasan Pendaftaran Terbaru */}
            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xs overflow-hidden">
              <div className="p-6 sm:p-7 border-b border-slate-200/60 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-slate-900">
                    Pengajuan Pendaftaran Terbaru
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Daftar pengajuan pendaftaran program bimbingan belajar terkini.
                  </p>
                </div>
                <Link
                  href="/staf/pendaftaran"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors"
                >
                  Kelola Semua
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {safePendaftaran.length === 0 ? (
                <div className="p-8">
                  <EmptyState
                    title="Belum Ada Pendaftaran"
                    description="Belum ada siswa yang mengajukan pendaftaran program bimbel."
                    icon={UserCheck}
                    actionLabel="Buka Verifikasi Pendaftaran"
                    actionHref="/staf/pendaftaran"
                  />
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border-x-0 border-t-0 border-slate-200/60">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/70 border-b border-slate-200/60 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Nama Siswa</th>
                        <th className="px-6 py-4">Program</th>
                        <th className="px-6 py-4">Tanggal Daftar</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Aksi Cepat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {safePendaftaran.slice(0, 5).map((item) => {
                        const siswa = safeUsers.find((u) => u.id === item.siswaId);
                        const prog = safeProgram.find((p) => p.id === item.programId);
                        const formattedDate = formatDateOnly(item.tanggalDaftar);

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{siswa?.nama || "Siswa Baru"}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{siswa?.email || "-"}</div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">{prog?.nama || "Program Bimbel"}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{prog?.biaya}</div>
                        </td>

                        <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                          {formattedDate}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`text-[11px] font-semibold px-3 py-1 rounded-full border ${
                              item.status === "disetujui"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                                : item.status === "ditolak"
                                ? "bg-rose-50 text-rose-700 border-rose-200/60"
                                : "bg-amber-50 text-amber-700 border-amber-200/60"
                            }`}
                          >
                            {item.status.toUpperCase()}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {item.status === "menunggu" ? (
                              <>
                                <button
                                  onClick={() => updatePendaftaranStatus(item.id, "disetujui")}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60 text-xs font-semibold active:scale-95 duration-150 transition-all"
                                >
                                  Setujui
                                </button>
                                <button
                                  onClick={() => updatePendaftaranStatus(item.id, "ditolak")}
                                  className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60 text-xs font-semibold active:scale-95 duration-150 transition-all"
                                >
                                  Tolak
                                </button>
                              </>
                            ) : (
                              <Link
                                href="/staf/pendaftaran"
                                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                              >
                                Detail
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
