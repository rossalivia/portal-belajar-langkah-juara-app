"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import StatCard from "../../../components/StatCard";
import EmptyState from "../../../components/EmptyState";
import { useData } from "../../../context/DataContext";
import { db } from "../../../lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  HelpCircle,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  Sparkles,
  ChevronRight,
  Play,
  FileCheck,
  Send,
  Loader2,
} from "lucide-react";

// Bank Soal Baku SNBT & Ujian Mandiri Langkah Juara (Starter Quiz Dataset)
const DEFAULT_QUIZZES = [
  {
    id: "kuis-snbt-pu-01",
    judul: "Penalaran Umum (PU) - Penalaran Deduktif & Logika Analitik",
    deskripsi:
      "Uji kemampuan berpikir analitis, silogisme, dan penarikan kesimpulan logis standar UTBK-SNBT.",
    kategori: "Penalaran Umum",
    durasiMenit: 10,
    daftarSoal: [
      {
        id: "q1",
        pertanyaan:
          "Semua peserta bimbingan Langkah Juara rajin belajar. Sebagian orang yang rajin belajar memiliki nilai tryout di atas rata-rata. Kesimpulan yang paling tepat adalah...",
        pilihan: [
          "A. Semua peserta bimbingan Langkah Juara memiliki nilai tryout di atas rata-rata.",
          "B. Sebagian peserta bimbingan Langkah Juara memiliki nilai tryout di atas rata-rata.",
          "C. Tidak ada peserta bimbingan Langkah Juara yang nilainya di bawah rata-rata.",
          "D. Orang yang nilainya di atas rata-rata pasti peserta bimbingan Langkah Juara.",
        ],
        kunciJawaban: 1, // B
        pembahasan:
          "Berdasarkan silogisme kategorik parsial: 'Semua A adalah B' dan 'Sebagian B adalah C', maka simpulan validnya adalah 'Sebagian A adalah C'. Maka sebagian peserta bimbingan memiliki nilai di atas rata-rata.",
      },
      {
        id: "q2",
        pertanyaan:
          "Jika musim kemarau berkepanjangan, maka debit waduk menurun. Saat debit waduk menurun, pasokan listrik PLTA berkurang. Faktanya saat ini pasokan listrik PLTA tidak berkurang. Kesimpulan yang benar adalah...",
        pilihan: [
          "A. Musim kemarau tidak berkepanjangan.",
          "B. Debit waduk tetap menurun drastis.",
          "C. Terjadi pemadaman listrik berkala.",
          "D. Musim kemarau berkepanjangan tetapi waduk normal.",
        ],
        kunciJawaban: 0, // A
        pembahasan:
          "Menggunakan aturan Modus Tollens berantai: P → Q, Q → R. Diketahui ~R (pasokan listrik tidak berkurang), maka ~Q (debit waduk tidak menurun), sehingga ~P (musim kemarau tidak berkepanjangan).",
      },
      {
        id: "q3",
        pertanyaan:
          "Pola deret angka: 3, 6, 12, 15, 30, 33, ... Angka berikutnya pada deret tersebut adalah...",
        pilihan: ["A. 36", "B. 45", "C. 66", "D. 60"],
        kunciJawaban: 2, // C
        pembahasan:
          "Pola operasi berselang-seling: dikali 2, lalu ditambah 3 (+3, *2, +3, *2, ...). 3 (*2)=6; (+3)=9? Cek pola: 3 (*2)=6, (+6)? Bukan. 3 (*2)=6; 6 (+6)=12; 12 (+3)=15; 15 (*2)=30; 30 (+3)=33; berikutnya 33 (*2) = 66.",
      },
      {
        id: "q4",
        pertanyaan:
          "Sebuah bejana silinder berisi air 1/3 bagian. Jika ditambahkan 6 liter air, volumenya menjadi 1/2 bagian. Kapasitas volume penuh bejana tersebut adalah...",
        pilihan: ["A. 24 Liter", "B. 36 Liter", "C. 42 Liter", "D. 48 Liter"],
        kunciJawaban: 1, // B
        pembahasan:
          "Misalkan kapasitas bejana = V. Maka: 1/2 V - 1/3 V = 6 liter → (3/6 - 2/6) V = 6 → 1/6 V = 6 → V = 36 Liter.",
      },
      {
        id: "q5",
        pertanyaan:
          "Semua dosen adalah sarjana. Sebagian dosen adalah penulis buku. Maka...",
        pilihan: [
          "A. Semua sarjana adalah penulis buku.",
          "B. Sebagian sarjana adalah penulis buku.",
          "C. Semua penulis buku adalah dosen.",
          "D. Tidak ada sarjana yang menjadi dosen.",
        ],
        kunciJawaban: 1, // B
        pembahasan:
          "Karena sebagian dosen adalah penulis buku dan semua dosen adalah sarjana, maka pasti sebagian sarjana adalah penulis buku.",
      },
    ],
  },
  {
    id: "kuis-snbt-pk-02",
    judul: "Pengetahuan Kuantitatif & Aritmetika Cepat",
    deskripsi:
      "Latihan kalkulasi matematika dasar, aljabar, persentase, dan interpretasi numerik.",
    kategori: "Penalaran Kuantitatif",
    durasiMenit: 10,
    daftarSoal: [
      {
        id: "q1",
        pertanyaan:
          "Jika 25% dari suatu bilangan X adalah 60, berapakah 40% dari bilangan X tersebut?",
        pilihan: ["A. 84", "B. 96", "C. 100", "D. 120"],
        kunciJawaban: 1, // B
        pembahasan:
          "X = 60 / 0.25 = 240. Maka 40% dari 240 = 0.4 * 240 = 96.",
      },
      {
        id: "q2",
        pertanyaan:
          "Harga sebuah jaket setelah mendapat diskon 20% adalah Rp 240.000. Berapakah harga normal jaket tersebut sebelum diskon?",
        pilihan: [
          "A. Rp 280.000",
          "B. Rp 288.000",
          "C. Rp 300.000",
          "D. Rp 320.000",
        ],
        kunciJawaban: 2, // C
        pembahasan:
          "Harga Diskon = 80% dari Harga Asli. Maka Harga Asli = Rp 240.000 / 0.8 = Rp 300.000.",
      },
      {
        id: "q3",
        pertanyaan:
          "Jika a = 3 dan b = -2, berapakah nilai dari ekspresi 2a² - 3ab + b³?",
        pilihan: ["A. 28", "B. 26", "C. 20", "D. 18"],
        kunciJawaban: 0, // A
        pembahasan:
          "2(3)² - 3(3)(-2) + (-2)³ = 2(9) - (-18) + (-8) = 18 + 18 - 8 = 28.",
      },
      {
        id: "q4",
        pertanyaan:
          "Rata-rata nilai 4 siswa adalah 75. Jika nilai seorang siswa baru ditambahkan, rata-ratanya naik menjadi 78. Berapakah nilai siswa baru tersebut?",
        pilihan: ["A. 86", "B. 88", "C. 90", "D. 92"],
        kunciJawaban: 2, // C
        pembahasan:
          "Total nilai 4 siswa = 4 * 75 = 300. Total nilai 5 siswa = 5 * 78 = 390. Nilai siswa baru = 390 - 300 = 90.",
      },
    ],
  },
];

export default function KuisLatihanCBTPage() {
  const { currentUser, isLoaded, saveHasilKuis } = useData();

  // Mode: "lobby" | "exam" | "review"
  const [activeMode, setActiveMode] = useState("lobby");
  const [quizzes, setQuizzes] = useState(DEFAULT_QUIZZES);
  const [userResults, setUserResults] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  // Exam States
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(600);
  const [examResult, setExamResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Sinkronisasi Data Kuis & Riwayat Hasil Kuis dari Cloud Firestore
  useEffect(() => {
    if (!currentUser?.id) return;

    // Ambil riwayat hasil pengerjaan kuis siswa
    const qHasil = query(
      collection(db, "hasil_kuis"),
      where("siswaId", "==", currentUser.id)
    );
    const unsubHasil = onSnapshot(
      qHasil,
      (snap) => {
        setUserResults(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => console.error("Error reading hasil_kuis:", err)
    );

    // Ambil data kuis kustom dari Firestore jika ada
    const unsubKuis = onSnapshot(
      collection(db, "kuis"),
      (snap) => {
        if (!snap.empty) {
          const remoteList = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          // Gabungkan default quizzes dengan kuis custom dari Firestore
          setQuizzes([...DEFAULT_QUIZZES, ...remoteList]);
        }
      },
      (err) => console.error("Error reading kuis:", err)
    );

    return () => {
      unsubHasil();
      unsubKuis();
    };
  }, [currentUser?.id]);

  // 2. Countdown Timer saat ujian aktif
  useEffect(() => {
    if (activeMode !== "exam") return;

    if (timeLeftSeconds <= 0) {
      handleFinishExam();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeMode, timeLeftSeconds]);

  // Memulai Ujian Kuis
  const handleStartQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setTimeLeftSeconds((quiz.durasiMenit || 10) * 60);
    setExamResult(null);
    setActiveMode("exam");
  };

  // Pilih Opsi Jawaban
  const handleSelectOption = (optIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optIndex,
    }));
  };

  // Selesaikan Ujian & Hitung Skor Instan
  const handleFinishExam = async () => {
    if (!selectedQuiz || isSubmitting) return;
    setIsSubmitting(true);

    const questions = selectedQuiz.daftarSoal || [];
    let correctCount = 0;

    questions.forEach((q, idx) => {
      const chosen = selectedAnswers[idx];
      if (chosen === q.kunciJawaban) {
        correctCount += 1;
      }
    });

    const finalScore = Math.round((correctCount / questions.length) * 100);
    const totalDurationSeconds = (selectedQuiz.durasiMenit || 10) * 60;
    const timeSpent = totalDurationSeconds - timeLeftSeconds;

    const resultPayload = {
      kuisId: selectedQuiz.id,
      judulKuis: selectedQuiz.judul,
      skor: finalScore,
      totalSoal: questions.length,
      jawabanBenar: correctCount,
      jawabanSalah: questions.length - correctCount,
      jawabanSiswa: selectedAnswers,
      waktuPengerjaanDetik: timeSpent,
    };

    setExamResult(resultPayload);

    // Simpan ke Cloud Firestore melalui DataContext
    try {
      if (typeof saveHasilKuis === "function") {
        await saveHasilKuis({
          kuisId: selectedQuiz.id,
          jawabanSiswa: Object.entries(selectedAnswers).map(([qIdx, ans]) => ({
            soalIndex: Number(qIdx),
            pilihanJawaban: ans,
          })),
          skor: finalScore,
          totalSoal: questions.length,
          waktuPengerjaanDetik: timeSpent,
        });
      }
    } catch (err) {
      console.error("Gagal simpan skor:", err);
    } finally {
      setIsSubmitting(false);
      setActiveMode("review");
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Cari skor tertinggi pengguna untuk kuis tertentu
  const getBestScore = (quizId) => {
    const attempts = userResults.filter((r) => r.kuisId === quizId);
    if (attempts.length === 0) return null;
    return Math.max(...attempts.map((a) => a.skor || 0));
  };

  return (
    <DashboardLayout
      title="Latihan Soal CBT & Kuis Interaktif"
      subtitle="Uji pemahaman materi secara mandiri dengan sistem penilaian Computer Based Test (CBT) dan pembahasan instan."
    >
      <div className="space-y-6">
        {/* ============================================================== */}
        {/* 1. MODE LOBBY / BANK SOAL KUIS                                */}
        {/* ============================================================== */}
        {activeMode === "lobby" && (
          <>
            {/* Metrik Statistik Siswa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Bank Soal"
                value={quizzes.length}
                subtitle="Paket latihan siap dikerjakan"
                icon={BookOpen}
                color="sky"
              />
              <StatCard
                title="Latihan Dikerjakan"
                value={userResults.length}
                subtitle="Total riwayat pengerjaan CBT"
                icon={FileCheck}
                color="emerald"
              />
              <StatCard
                title="Rata-rata Skor CBT"
                value={
                  userResults.length > 0
                    ? `${Math.round(
                        userResults.reduce((a, b) => a + (b.skor || 0), 0) /
                          userResults.length
                      )}`
                    : "0"
                }
                subtitle="Capaian latihan mandiri"
                icon={Award}
                color="purple"
              />
              <StatCard
                title="Skor Tertinggi"
                value={
                  userResults.length > 0
                    ? `${Math.max(...userResults.map((u) => u.skor || 0))}`
                    : "0"
                }
                subtitle="Prestasi terbaik Anda"
                icon={Sparkles}
                color="amber"
              />
            </div>

            {/* Daftar Kuis CBT Tersedia */}
            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xs overflow-hidden">
              <div className="p-6 sm:p-7 border-b border-slate-200/60 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-slate-900">
                    Pilihan Paket Latihan CBT & Tryout Mandiri
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Pilih paket soal untuk memulai latihan berbasis waktu. Nilai dan pembahasan langsung muncul setelah selesai.
                  </p>
                </div>
                <span className="text-xs font-semibold px-3 py-1 bg-[#F2F2F7] text-slate-700 rounded-full border border-slate-200/50">
                  {quizzes.length} Paket Soal
                </span>
              </div>

              <div className="p-6 sm:p-7 grid grid-cols-1 md:grid-cols-2 gap-5">
                {quizzes.map((quiz) => {
                  const best = getBestScore(quiz.id);
                  const totalQuestions = quiz.daftarSoal?.length || 0;

                  return (
                    <div
                      key={quiz.id}
                      className="p-6 rounded-3xl border border-slate-200/60 hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between bg-white shadow-xs"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                            {quiz.kategori || "Umum"}
                          </span>
                          {best != null && (
                            <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                              Skor Terbaik: {best}/100
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-bold text-slate-900 leading-snug">
                          {quiz.judul}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                          {quiz.deskripsi}
                        </p>

                        <div className="flex items-center gap-4 mt-5 pt-3.5 border-t border-slate-100 text-xs text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{quiz.durasiMenit || 10} Menit</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                            <span>{totalQuestions} Butir Soal</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 font-medium">
                          {best != null ? "Pernah dikerjakan" : "Belum dicoba"}
                        </span>
                        <button
                          onClick={() => handleStartQuiz(quiz)}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs active:scale-95 duration-150 transition-all"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>{best != null ? "Uji Kembali" : "Mulai Kuis CBT"}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ============================================================== */}
        {/* 2. MODE ACTIVE CBT EXAM (SIMULASI PENGERJAAN SOAL)             */}
        {/* ============================================================== */}
        {activeMode === "exam" && selectedQuiz && (
          <div className="space-y-5">
            {/* Exam Header Bar */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                  Simulasi CBT Sedang Berlangsung
                </span>
                <h2 className="text-base font-bold text-slate-900 mt-1">
                  {selectedQuiz.judul}
                </h2>
              </div>

              {/* Countdown Timer */}
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-bold text-xs ${
                  timeLeftSeconds <= 120
                    ? "bg-rose-50 text-rose-700 border-rose-300 animate-pulse"
                    : "bg-blue-50 text-blue-700 border-blue-200/60"
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Sisa Waktu: {formatTimer(timeLeftSeconds)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Question Area (3 Cols) */}
              <div className="lg:col-span-3 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/60 shadow-xs flex flex-col justify-between min-h-[460px]">
                {(() => {
                  const currentQ = selectedQuiz.daftarSoal[currentQuestionIndex];
                  const chosenOption = selectedAnswers[currentQuestionIndex];

                  return (
                    <div className="space-y-6">
                      {/* Nomor Soal & Keterangan */}
                      <div className="flex items-center justify-between pb-4 border-b border-slate-200/60">
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
                          Soal Nomor {currentQuestionIndex + 1} dari{" "}
                          {selectedQuiz.daftarSoal.length}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {chosenOption != null ? "Sudah Dijawab" : "Belum Dijawab"}
                        </span>
                      </div>

                      {/* Teks Soal */}
                      <p className="text-sm md:text-base font-medium text-slate-900 leading-relaxed">
                        {currentQ.pertanyaan}
                      </p>

                      {/* Pilihan Jawaban A, B, C, D */}
                      <div className="space-y-3 pt-2">
                        {currentQ.pilihan.map((pil, idx) => {
                          const isSelected = chosenOption === idx;

                          return (
                            <div
                              key={idx}
                              onClick={() => handleSelectOption(idx)}
                              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                                isSelected
                                  ? "bg-blue-50/80 border-blue-500/80 ring-2 ring-blue-500/20 text-blue-950 font-bold shadow-xs"
                                  : "bg-white border-slate-200/70 hover:border-slate-300 hover:bg-[#F2F2F7]/50 text-slate-800"
                              }`}
                            >
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                                  isSelected
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {["A", "B", "C", "D"][idx]}
                              </div>
                              <span className="text-xs md:text-sm leading-relaxed">
                                {pil.replace(/^[A-D]\.\s*/, "")}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Navigasi Bawah */}
                <div className="pt-6 mt-6 border-t border-slate-200/60 flex items-center justify-between">
                  <button
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-slate-200/80 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 active:scale-95 duration-150 transition-all disabled:opacity-40"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Sebelumnya</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {currentQuestionIndex < selectedQuiz.daftarSoal.length - 1 ? (
                      <button
                        onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs active:scale-95 duration-150 transition-all"
                      >
                        <span>Selanjutnya</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={handleFinishExam}
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs active:scale-95 duration-150 transition-all"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Menghitung Skor...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Kumpulkan Ujian</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigator Kotak Soal (1 Col) */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs space-y-5">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Navigasi Butir Soal
                </h3>

                <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 gap-2">
                  {selectedQuiz.daftarSoal.map((_, idx) => {
                    const isAnswered = selectedAnswers[idx] != null;
                    const isCurrent = currentQuestionIndex === idx;

                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentQuestionIndex(idx)}
                        className={`h-10 rounded-xl font-bold text-xs flex items-center justify-center transition-all active:scale-95 duration-150 ${
                          isCurrent
                            ? "bg-blue-600 text-white ring-2 ring-blue-500/40 shadow-xs"
                            : isAnswered
                            ? "bg-emerald-500 text-white"
                            : "bg-[#F2F2F7] text-slate-700 hover:bg-slate-200/80"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-slate-200/60 text-[11px] text-slate-500 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                    <span>Sudah dijawab</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                    <span>Soal aktif</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
                    <span>Belum dijawab</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleFinishExam}
                    disabled={isSubmitting}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs active:scale-95 duration-150 transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Selesai & Kumpulkan</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 3. MODE HASIL INSTAN & PEMBAHASAN EDUKATIF                     */}
        {/* ============================================================== */}
        {activeMode === "review" && examResult && selectedQuiz && (
          <div className="space-y-6">
            {/* Banner Skor Capaian */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 md:p-8 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center md:text-left">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/20 text-white uppercase tracking-wider inline-block">
                  Hasil Evaluasi CBT
                </span>
                <h2 className="text-xl md:text-2xl font-black tracking-tight">
                  {selectedQuiz.judul}
                </h2>
                <p className="text-xs text-blue-100">
                  Data pengerjaan telah otomatis tersimpan ke Cloud Firestore portal Anda.
                </p>
              </div>

              {/* Box Skor */}
              <div className="p-5 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 text-center min-w-[160px]">
                <div className="text-[11px] text-blue-200 uppercase font-bold">Skor Akhir</div>
                <div className="text-4xl font-black font-mono my-1">
                  {examResult.skor}
                  <span className="text-base font-normal text-blue-200">/100</span>
                </div>
                <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-white text-blue-900 inline-block shadow-xs">
                  {examResult.skor >= 80 ? "Sangat Memuaskan" : examResult.skor >= 60 ? "Cukup Baik" : "Perlu Belajar Lagi"}
                </span>
              </div>
            </div>

            {/* Statistik Detail Pengerjaan */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 bg-white rounded-2xl border border-slate-200/60 shadow-xs text-center">
                <div className="text-[11px] text-slate-500 font-medium">Jawaban Benar</div>
                <div className="text-2xl font-bold text-emerald-600 font-mono mt-1">
                  {examResult.jawabanBenar}
                </div>
              </div>
              <div className="p-5 bg-white rounded-2xl border border-slate-200/60 shadow-xs text-center">
                <div className="text-[11px] text-slate-500 font-medium">Jawaban Salah</div>
                <div className="text-2xl font-bold text-rose-600 font-mono mt-1">
                  {examResult.jawabanSalah}
                </div>
              </div>
              <div className="p-5 bg-white rounded-2xl border border-slate-200/60 shadow-xs text-center">
                <div className="text-[11px] text-slate-500 font-medium">Total Soal</div>
                <div className="text-2xl font-bold text-slate-800 font-mono mt-1">
                  {examResult.totalSoal}
                </div>
              </div>
              <div className="p-5 bg-white rounded-2xl border border-slate-200/60 shadow-xs text-center">
                <div className="text-[11px] text-slate-500 font-medium">Durasi Pengerjaan</div>
                <div className="text-xl font-bold text-blue-600 font-mono mt-1.5">
                  {Math.floor(examResult.waktuPengerjaanDetik / 60)}m {examResult.waktuPengerjaanDetik % 60}s
                </div>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => setActiveMode("lobby")}
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-xs active:scale-95 duration-150 transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Bank Soal</span>
              </button>
              <button
                onClick={() => handleStartQuiz(selectedQuiz)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs active:scale-95 duration-150 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Ulangi Ujian Ini</span>
              </button>
            </div>

            {/* Pembahasan Edukatif Tiap Butir Soal */}
            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xs p-6 sm:p-8 space-y-6">
              <div className="border-b border-slate-200/60 pb-4">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Kunci Jawaban & Pembahasan Mendalam
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Pelajari konsep dan cara pengerjaan dari setiap butir soal untuk memperdalam penguasaan materi Anda.
                </p>
              </div>

              <div className="space-y-5">
                {selectedQuiz.daftarSoal.map((q, idx) => {
                  const studentAns = examResult.jawabanSiswa[idx];
                  const isCorrect = studentAns === q.kunciJawaban;

                  return (
                    <div
                      key={idx}
                      className={`p-5 sm:p-6 rounded-2xl border space-y-3.5 ${
                        isCorrect
                          ? "bg-emerald-50/30 border-emerald-200/60"
                          : "bg-rose-50/30 border-rose-200/60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">
                          Soal Nomor {idx + 1}
                        </span>
                        {isCorrect ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-3 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Jawaban Benar</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-700 bg-rose-100/70 border border-rose-200 px-3 py-0.5 rounded-full">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Jawaban Kurang Tepat</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs md:text-sm font-semibold text-slate-900 leading-relaxed">
                        {q.pertanyaan}
                      </p>

                      {/* Detail Pilihan Siswa vs Kunci */}
                      <div className="text-xs space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-medium">Jawaban Anda:</span>
                          <span
                            className={`font-semibold ${
                              isCorrect ? "text-emerald-700" : "text-rose-600"
                            }`}
                          >
                            {studentAns != null
                              ? q.pilihan[studentAns]
                              : "Tidak Dijawab"}
                          </span>
                        </div>
                        {!isCorrect && (
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 font-medium">Kunci Jawaban yang Benar:</span>
                            <span className="font-semibold text-emerald-700">
                              {q.pilihan[q.kunciJawaban]}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Kotak Pembahasan */}
                      <div className="p-4 bg-white rounded-xl border border-slate-200/60 text-xs space-y-1.5 shadow-2xs">
                        <span className="font-bold text-blue-700 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                          <span>Pembahasan Edukatif:</span>
                        </span>
                        <p className="text-slate-700 leading-relaxed italic">
                          {q.pembahasan}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
