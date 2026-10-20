"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import DashboardLayout from "../../../components/DashboardLayout";
import StatCard from "../../../components/StatCard";
import EmptyState from "../../../components/EmptyState";
import { useData } from "../../../context/DataContext";
import { formatDateTime } from "../../../lib/dateUtils";
import {
  Calendar as CalendarIcon,
  Clock,
  BookOpen,
  FileText,
  CheckCircle2,
  AlertCircle,
  Filter,
  ChevronLeft,
  ChevronRight,
  MapPin,
  User,
  ExternalLink,
  CalendarDays,
  ListFilter,
  Sparkles,
} from "lucide-react";

export default function JadwalPelajaranPage() {
  const {
    isLoaded,
    currentUser,
    kelas = [],
    tugas = [],
    program = [],
    pendaftaran = [],
    users = [],
  } = useData();

  const [viewMode, setViewMode] = useState("agenda"); // "agenda" | "kalender"
  const [filterType, setFilterType] = useState("semua"); // "semua" | "kelas" | "tugas" | "ujian"
  const [filterTime, setFilterTime] = useState("mendatang"); // "mendatang" | "hari_ini" | "semua"
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);

  const safeKelas = Array.isArray(kelas) ? kelas : [];
  const safeTugas = Array.isArray(tugas) ? tugas : [];
  const safeProgram = Array.isArray(program) ? program : [];
  const safePendaftaran = Array.isArray(pendaftaran) ? pendaftaran : [];
  const safeUsers = Array.isArray(users) ? users : [];

  // 1. Dapatkan kelas yang diikuti siswa saat ini
  const myKelas = safeKelas.filter(
    (k) => Array.isArray(k.siswaIds) && k.siswaIds.includes(currentUser?.id)
  );
  const myKelasIds = myKelas.map((k) => k.id);

  // 2. Dapatkan program yang disetujui untuk siswa
  const myApprovedProgramIds = safePendaftaran
    .filter((p) => p.siswaId === currentUser?.id && (p.status === "disetujui" || p.status === "aktif"))
    .map((p) => p.programId);

  // 3. Susun seluruh agenda bimbingan & penugasan menjadi satu array terpadu
  const events = useMemo(() => {
    const list = [];
    const now = new Date();

    // A. Pertemuan Kelas Terjadwal (Jadwal Bimbingan Rutin & Spesifik)
    myKelas.forEach((kl) => {
      const prog = safeProgram.find((p) => p.id === kl.programId);
      const tutor = safeUsers.find((u) => u.id === kl.tutorId);

      // Simulasikan tanggal pertemuan kelas untuk 30 hari ke depan berdasarkan nama/jadwal kelas
      // Jika kelas memiliki jadwalHari (misal: "Senin", "Rabu", "Jumat")
      const hariMap = {
        minggu: 0,
        senin: 1,
        selasa: 2,
        rabu: 3,
        kamis: 4,
        jumat: 5,
        sabtu: 6,
      };

      const jadwalText = kl.jadwalHari || kl.jadwal || "Senin & Kamis";
      const matchedDays = Object.keys(hariMap).filter((h) =>
        jadwalText.toLowerCase().includes(h)
      );

      // Jika tidak ada nama hari spesifik, defaultkan ke setiap 3 hari
      const daysToGenerate = matchedDays.length > 0 ? matchedDays : ["senin", "kamis"];

      // Generate 4 sesi pertemuan ke depan
      for (let offset = -7; offset <= 21; offset++) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, 16, 0, 0);
        const dayName = Object.keys(hariMap).find((k) => hariMap[k] === d.getDay());

        if (daysToGenerate.includes(dayName)) {
          list.push({
            id: `kelas-${kl.id}-${d.toISOString()}`,
            tipe: "kelas",
            judul: `Sesi Bimbingan: ${kl.nama}`,
            subjudul: prog?.judul || prog?.nama || "Program Belajar Terpadu",
            tanggal: d,
            jam: "16:00 - 17:30 WIB",
            lokasi: "Ruang Kelas Online / Lab 2",
            tutor: tutor?.nama || "Tutor Bimbingan",
            kelasId: kl.id,
            badgeColor: "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20 border-blue-200",
            icon: BookOpen,
          });
        }
      }
    });

    // B. Tenggat Waktu Tugas (Deadline dari koleksi tugas)
    safeTugas
      .filter((tg) => myKelasIds.includes(tg.kelasId) || !tg.kelasId)
      .forEach((tg) => {
        let deadlineDate = null;
        if (tg.tenggatWaktu) {
          if (typeof tg.tenggatWaktu?.toDate === "function") {
            deadlineDate = tg.tenggatWaktu.toDate();
          } else if (tg.tenggatWaktu?.seconds != null) {
            deadlineDate = new Date(tg.tenggatWaktu.seconds * 1000);
          } else {
            deadlineDate = new Date(tg.tenggatWaktu);
          }
        }
        if (!deadlineDate || isNaN(deadlineDate.getTime())) {
          deadlineDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
        }

        const kl = safeKelas.find((k) => k.id === tg.kelasId);

        list.push({
          id: `tugas-${tg.id}`,
          tipe: "tugas",
          judul: `Tenggat Tugas: ${tg.judul}`,
          subjudul: kl ? `Kelas: ${kl.nama}` : "Penugasan Mandiri",
          tanggal: deadlineDate,
          jam: "Batas 23:59 WIB",
          lokasi: "Pengumpulan Digital di Portal",
          tutor: "Sistem Otomatis",
          tugasId: tg.id,
          badgeColor: "bg-rose-50 text-rose-700 ring-1 ring-rose-600/20 border-rose-200",
          icon: FileText,
        });
      });

    // C. Agenda Kuis & Simulasi Ujian Mandiri
    myApprovedProgramIds.forEach((pId) => {
      const prog = safeProgram.find((p) => p.id === pId);
      const examDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5, 10, 0, 0);

      list.push({
        id: `ujian-${pId}`,
        tipe: "ujian",
        judul: `Simulasi Ujian / Kuis CBT: ${prog?.judul || prog?.nama || "Evaluasi"}`,
        subjudul: "Uji Kompetensi Berkala",
        tanggal: examDate,
        jam: "10:00 - 11:30 WIB",
        lokasi: "Modul CBT Langkah Juara",
        tutor: "Tim Akademik",
        badgeColor: "bg-purple-50 text-purple-700 ring-1 ring-purple-600/20 border-purple-200",
        icon: Sparkles,
      });
    });

    // Urutkan kronologis ascending berdasarkan tanggal
    list.sort((a, b) => a.tanggal.getTime() - b.tanggal.getTime());
    return list;
  }, [myKelas, safeProgram, safeUsers, safeTugas, myKelasIds, myApprovedProgramIds]);

  // Filter events sesuai pilihan pengguna
  const filteredEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return events.filter((ev) => {
      // Filter Tipe
      if (filterType !== "semua" && ev.tipe !== filterType) return false;

      // Filter Waktu
      const evDate = new Date(ev.tanggal);
      evDate.setHours(0, 0, 0, 0);

      if (filterTime === "mendatang") {
        return evDate.getTime() >= today.getTime();
      }
      if (filterTime === "hari_ini") {
        return evDate.getTime() === today.getTime();
      }
      return true;
    });
  }, [events, filterType, filterTime]);

  // Metrik Statistik Agenda
  const upcomingCount = events.filter((e) => e.tanggal >= new Date()).length;
  const todayCount = events.filter((e) => {
    const d = new Date(e.tanggal);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;
  const taskDeadlineCount = events.filter((e) => e.tipe === "tugas" && e.tanggal >= new Date()).length;

  return (
    <DashboardLayout
      title="Jadwal Pelajaran & Agenda Belajar"
      subtitle="Kalender terpadu sesi bimbingan tatap muka, tenggat waktu pengumpulan tugas, dan agenda ujian program Anda."
    >
      <div className="space-y-6">
        {/* Metrik Statistik Cepat */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Agenda Mendatang"
            value={upcomingCount}
            subtitle="Sesi kelas & deadline aktif"
            icon={CalendarDays}
            color="sky"
          />
          <StatCard
            title="Kegiatan Hari Ini"
            value={todayCount}
            subtitle="Agenda terjadwal hari ini"
            icon={Clock}
            color="emerald"
            trend={todayCount > 0 ? "Ada Kegiatan" : undefined}
          />
          <StatCard
            title="Tenggat Tugas"
            value={taskDeadlineCount}
            subtitle="Tugas menunggu diselesaikan"
            icon={FileText}
            color="rose"
          />
          <StatCard
            title="Rombel Diikuti"
            value={myKelas.length}
            subtitle="Kelas bimbingan aktif"
            icon={BookOpen}
            color="purple"
          />
        </div>

        {/* Action & Filter Toolbar */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Filter Tipe & Waktu */}
          <div className="flex items-center gap-3 flex-wrap w-full md:w-auto">
            <div className="flex items-center p-1 bg-[#F2F2F7] rounded-xl text-xs border border-slate-200/50">
              <button
                onClick={() => setFilterTime("mendatang")}
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                  filterTime === "mendatang"
                    ? "bg-white text-blue-600 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Mendatang ({upcomingCount})
              </button>
              <button
                onClick={() => setFilterTime("hari_ini")}
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                  filterTime === "hari_ini"
                    ? "bg-white text-emerald-600 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Hari Ini ({todayCount})
              </button>
              <button
                onClick={() => setFilterTime("semua")}
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                  filterTime === "semua"
                    ? "bg-white text-slate-800 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Semua ({events.length})
              </button>
            </div>

            {/* Filter Kategori */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs px-4 py-2.5 bg-[#F2F2F7]/60 border border-slate-200/60 rounded-xl text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold cursor-pointer"
            >
              <option value="semua">Semua Kategori</option>
              <option value="kelas">Sesi Kelas Bimbingan</option>
              <option value="tugas">Tenggat Waktu Tugas</option>
              <option value="ujian">Simulasi / Kuis CBT</option>
            </select>
          </div>

          {/* Toggle View Mode */}
          <div className="flex items-center gap-1 p-1 bg-[#F2F2F7] rounded-xl text-xs shrink-0 border border-slate-200/50">
            <button
              onClick={() => setViewMode("agenda")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                viewMode === "agenda"
                  ? "bg-white text-blue-600 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Daftar Agenda</span>
            </button>
            <button
              onClick={() => setViewMode("kalender")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                viewMode === "kalender"
                  ? "bg-white text-blue-600 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Grid Kalender</span>
            </button>
          </div>
        </div>

        {/* Tampilan 1: Mode Daftar Agenda Kronologis */}
        {viewMode === "agenda" && (
          <div className="space-y-3">
            {filteredEvents.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-slate-200/80 shadow-sm text-center">
                <EmptyState
                  title="Tidak Ada Agenda Terjadwal"
                  description="Tidak ditemukan jadwal bimbingan atau tugas sesuai filter yang Anda terapkan."
                  icon={CalendarDays}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEvents.map((ev) => {
                  const Icon = ev.icon;
                  const isToday =
                    new Date(ev.tanggal).toDateString() === new Date().toDateString();
                  const isPast = new Date(ev.tanggal) < new Date();

                  return (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEvent(ev)}
                      className={`cursor-pointer bg-white rounded-3xl border p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between shadow-xs ${
                        isToday
                          ? "border-emerald-300 ring-2 ring-emerald-500/10 shadow-xs"
                          : "border-slate-200/60 hover:border-blue-300"
                      }`}
                    >
                      <div>
                        {/* Header Item */}
                        <div className="flex items-start justify-between gap-2 mb-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-full border ${ev.badgeColor}`}
                          >
                            <Icon className="w-3 h-3" />
                            {ev.tipe === "kelas"
                              ? "Kelas Bimbingan"
                              : ev.tipe === "tugas"
                              ? "Tenggat Tugas"
                              : "Kuis CBT"}
                          </span>
                          {isToday && (
                            <span className="text-[10px] font-bold px-2.5 py-0.5 bg-emerald-500 text-white rounded-full animate-pulse">
                              Hari Ini
                            </span>
                          )}
                        </div>

                        {/* Judul & Keterangan */}
                        <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
                          {ev.judul}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                          {ev.subjudul}
                        </p>

                        {/* Metadata Sesi */}
                        <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-semibold text-slate-800">
                              {ev.tanggal.toLocaleDateString("id-ID", {
                                weekday: "long",
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{ev.jam}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{ev.lokasi}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate font-semibold text-slate-700">
                              {ev.tutor}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Link */}
                      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-1 hover:text-blue-700">
                          Lihat Detail Agenda <ChevronRight className="w-3 h-3" />
                        </span>
                        {ev.tugasId && (
                          <Link
                            href={`/tugas/${ev.tugasId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="px-3 py-1 bg-blue-50 text-blue-700 font-semibold rounded-full border border-blue-200/60 hover:bg-blue-100 transition-colors text-[11px] flex items-center gap-1.5"
                          >
                            <span>Buka Tugas</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tampilan 2: Mode Grid Kalender Bulanan Interaktif */}
        {viewMode === "kalender" && (
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xs p-6 sm:p-8 space-y-5">
            {/* Kalender Header */}
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {currentMonthDate.toLocaleDateString("id-ID", {
                    month: "long",
                    year: "numeric",
                  })}
                </h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setCurrentMonthDate(
                      new Date(
                        currentMonthDate.getFullYear(),
                        currentMonthDate.getMonth() - 1,
                        1
                      )
                    )
                  }
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentMonthDate(new Date())}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700"
                >
                  Bulan Ini
                </button>
                <button
                  onClick={() =>
                    setCurrentMonthDate(
                      new Date(
                        currentMonthDate.getFullYear(),
                        currentMonthDate.getMonth() + 1,
                        1
                      )
                    )
                  }
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Nama Hari */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-500 uppercase tracking-wider py-2 bg-slate-50 rounded-lg">
              <div>Min</div>
              <div>Sen</div>
              <div>Sel</div>
              <div>Rab</div>
              <div>Kam</div>
              <div>Jum</div>
              <div>Sab</div>
            </div>

            {/* Kotak Tanggal */}
            {(() => {
              const year = currentMonthDate.getFullYear();
              const month = currentMonthDate.getMonth();
              const firstDayIndex = new Date(year, month, 1).getDay();
              const daysInMonth = new Date(year, month + 1, 0).getDate();
              const todayStr = new Date().toDateString();

              const cells = [];
              // Kosongkan hari sebelum tanggal 1
              for (let i = 0; i < firstDayIndex; i++) {
                cells.push(
                  <div key={`blank-${i}`} className="min-h-[90px] p-1.5 bg-slate-50/40 rounded-lg" />
                );
              }

              // Isi tanggal hari ini
              for (let day = 1; day <= daysInMonth; day++) {
                const dayDate = new Date(year, month, day);
                const isToday = dayDate.toDateString() === todayStr;

                // Cari agenda pada tanggal ini
                const dayEvents = events.filter((e) => {
                  const ed = new Date(e.tanggal);
                  return (
                    ed.getFullYear() === year &&
                    ed.getMonth() === month &&
                    ed.getDate() === day
                  );
                });

                cells.push(
                  <div
                    key={`day-${day}`}
                    className={`min-h-[90px] p-2 rounded-lg border transition-all ${
                      isToday
                        ? "bg-blue-50/40 border-blue-300 ring-1 ring-blue-500/20"
                        : "bg-white border-slate-200/70 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-xs font-bold inline-block w-5 h-5 text-center leading-5 rounded-full ${
                          isToday ? "bg-blue-600 text-white" : "text-slate-800"
                        }`}
                      >
                        {day}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="text-[10px] font-bold text-slate-400">
                          {dayEvents.length} agenda
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((ev) => (
                        <div
                          key={ev.id}
                          onClick={() => setSelectedEvent(ev)}
                          className={`cursor-pointer px-1.5 py-0.5 rounded text-[10px] font-semibold truncate border ${ev.badgeColor}`}
                          title={ev.judul}
                        >
                          {ev.tipe === "tugas" ? "⚠️ Tugas: " : "📚 "}
                          {ev.judul.replace("Sesi Bimbingan: ", "").replace("Tenggat Tugas: ", "")}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div
                          onClick={() => setSelectedEvent(dayEvents[0])}
                          className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer"
                        >
                          +{dayEvents.length - 2} lainnya
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              return <div className="grid grid-cols-7 gap-1.5">{cells}</div>;
            })()}
          </div>
        )}
      </div>

      {/* Modal Detail Agenda */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-md w-full p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-200/60">
              <div>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-3 py-1 rounded-full border ${selectedEvent.badgeColor}`}
                >
                  {selectedEvent.tipe === "kelas"
                    ? "Sesi Bimbingan Kelas"
                    : selectedEvent.tipe === "tugas"
                    ? "Tenggat Pengumpulan Tugas"
                    : "Simulasi Ujian CBT"}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-2 tracking-tight">
                  {selectedEvent.judul}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 active:scale-95 transition-all"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-4 text-xs text-slate-700">
              <div className="p-4 bg-[#F2F2F7]/50 rounded-2xl border border-slate-200/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Program / Rombel:</span>
                  <span className="font-bold text-slate-900">{selectedEvent.subjudul}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Tanggal:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {selectedEvent.tanggal.toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Waktu / Jam:</span>
                  <span className="font-bold text-blue-700 font-mono">{selectedEvent.jam}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Lokasi / Media:</span>
                  <span className="font-semibold text-slate-900">{selectedEvent.lokasi}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Tutor Pengajar:</span>
                  <span className="font-bold text-purple-700">{selectedEvent.tutor}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/60 flex items-center justify-end gap-2.5">
                {selectedEvent.tugasId && (
                  <Link
                    href={`/tugas/${selectedEvent.tugasId}`}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs active:scale-95 duration-150 transition-all flex items-center gap-1.5"
                  >
                    <span>Buka Lembar Tugas</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl active:scale-95 duration-150 transition-all"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
