"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import { useData } from "../../context/DataContext";
import { auth, db } from "../../lib/firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  GraduationCap,
  User,
  Mail,
  Phone,
  School,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

export default function DaftarPage() {
  const router = useRouter();
  const { authUser, userProfile, isLoadingAuth, showToast } = useData();

  const NO_HP_REGEX = /^08[0-9]{8,11}$/;

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    noHp: "",
    noHpOrangTua: "",
    sekolah: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusText, setStatusText] = useState("");

  // Jika pengguna sudah login, arahkan langsung sesuai peran
  useEffect(() => {
    if (!isLoadingAuth && authUser && userProfile) {
      if (userProfile.aktif === false) {
        signOut(auth);
        setErrorMessage("Akun Anda dinonaktifkan. Hubungi staf Langkah Juara");
        return;
      }
      const role = userProfile.role || "siswa";
      if (role === "staf") router.replace("/staf");
      else if (role === "tutor") router.replace("/tutor");
      else if (role === "super_admin" || role === "admin") router.replace("/admin");
      else router.replace("/beranda");
    }
  }, [isLoadingAuth, authUser, userProfile, router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Helper untuk memeriksa & membuat dokumen users/{uid} di Firestore
  const ensureUserFirestoreDocument = async (user, profileInfo = {}) => {
    setStatusText("Menyimpan data pengguna di database...");
    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      // Bila dokumen belum ada, buat dokumen baru dengan field nama, email, role = 'siswa', dan aktif: true
      // DILARANG KERAS menyimpan kata sandi (password) di dalam dokumen Firestore!
      const finalNoHp = profileInfo.noHp || profileInfo.telepon || "";
      const newUserData = {
        nama: profileInfo.nama || user.displayName || user.email?.split("@")[0] || "Siswa Baru",
        email: user.email,
        role: "siswa", // Otomatis 'siswa'
        aktif: true, // Otomatis aktif
        noHp: finalNoHp,
        telepon: finalNoHp, // Kompatibilitas mundur
        noHpOrangTua: profileInfo.noHpOrangTua || "",
        sekolah: profileInfo.sekolah || "",
        createdAt: new Date().toISOString(),
      };
      await setDoc(userRef, newUserData);
    } else {
      // Bila dokumen sudah ada, periksa status keaktifan akun
      const existingData = docSnap.data();
      if (existingData?.aktif === false) {
        await signOut(auth);
        throw new Error("Akun Anda dinonaktifkan. Hubungi staf Langkah Juara");
      }
    }
  };

  // 1. Submit Pendaftaran Baru dengan Email dan Kata Sandi
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.nama.trim()) {
      setErrorMessage("Nama lengkap siswa wajib diisi.");
      return;
    }

    // Validasi Regex Nomor HP Siswa: ^08[0-9]{8,11}$
    if (formData.noHp && !NO_HP_REGEX.test(formData.noHp.trim())) {
      setErrorMessage(
        "Nomor HP Siswa tidak valid. Wajib berupa angka 10–13 digit dan diawali dengan 08 (contoh: 081234567890)."
      );
      return;
    }

    // Validasi Regex Nomor HP Orang Tua: ^08[0-9]{8,11}$
    if (formData.noHpOrangTua && !NO_HP_REGEX.test(formData.noHpOrangTua.trim())) {
      setErrorMessage(
        "Nomor HP Orang Tua tidak valid. Wajib berupa angka 10–13 digit dan diawali dengan 08 (contoh: 081234567890)."
      );
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage("Kata sandi minimal 6 karakter.");
      return;
    }

    setIsSubmitting(true);
    setStatusText("Membuat akun di Firebase Authentication...");

    try {
      // Buat akun di Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email.trim(),
        formData.password
      );
      const user = userCredential.user;

      // Update displayName di Firebase Auth
      await updateProfile(user, {
        displayName: formData.nama.trim(),
      });

      // Buat dokumen users/{uid} di Firestore (role: 'siswa', TANPA password)
      await ensureUserFirestoreDocument(user, {
        nama: formData.nama.trim(),
        noHp: formData.noHp.trim(),
        noHpOrangTua: formData.noHpOrangTua.trim(),
        sekolah: formData.sekolah.trim(),
      });

      setStatusText("Pendaftaran selesai, menyiapkan dasbor...");
      showToast(`Selamat datang, ${formData.nama}! Akun siswa berhasil dibuat.`, "success");

      // Pastikan proses selesai baru diarahkan ke /beranda
      router.push("/beranda");
    } catch (err) {
      console.error("Error pendaftaran email/password:", err);
      let pesan = "Gagal mendaftarkan akun. Silakan coba lagi.";
      if (err.code === "auth/email-already-in-use") {
        pesan = "Alamat email ini sudah terdaftar. Silakan masuk melalui halaman /masuk.";
      } else if (err.code === "auth/invalid-email") {
        pesan = "Format alamat email tidak valid.";
      } else if (err.code === "auth/weak-password") {
        pesan = "Kata sandi terlalu lemah. Gunakan minimal 6 karakter.";
      } else if (err.message) {
        pesan = err.message;
      }
      setErrorMessage(pesan);
      setIsSubmitting(false);
      setStatusText("");
    }
  };

  // 2. Pendaftaran Cepat menggunakan Google (SSO)
  const handleGoogleSignUp = async () => {
    setErrorMessage("");
    setIsSubmitting(true);
    setStatusText("Menghubungkan ke Google Sign-In...");

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Cek dan buat dokumen Firestore users/{uid} bila belum ada
      await ensureUserFirestoreDocument(user, {
        nama: user.displayName || user.email?.split("@")[0] || "Siswa Baru",
      });

      setStatusText("Berhasil masuk, mengarahkan ke dasbor...");
      showToast(`Pendaftaran berhasil dengan akun Google: ${user.email}`, "success");

      // Pastikan proses selesai baru diarahkan
      router.push("/beranda");
    } catch (err) {
      console.error("Error registrasi Google:", err);
      let pesan = "Gagal mendaftar dengan Google.";
      if (err.message === "Akun Anda dinonaktifkan. Hubungi staf Langkah Juara") {
        pesan = err.message;
      } else if (err.code === "auth/popup-closed-by-user") {
        pesan = "Jendela pendaftaran Google ditutup sebelum proses selesai.";
      } else if (err.code === "auth/cancelled-popup-request") {
        pesan = "Permintaan pendaftaran Google dibatalkan.";
      } else if (err.message) {
        pesan = err.message;
      }
      setErrorMessage(pesan);
      setIsSubmitting(false);
      setStatusText("");
    }
  };

  // Tampilkan loading screen jika sesi akun sedang diperiksa
  if (isLoadingAuth || (authUser && userProfile && userProfile.aktif !== false)) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F2F2F7]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-16 h-16 rounded-3xl bg-white border border-slate-200/60 flex items-center justify-center text-blue-600 mb-4 shadow-xs">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Memeriksa Sesi Pengguna...
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Mengarahkan ke dasbor belajar Anda
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F2F2F7]">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-5 sm:p-8">
        <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/60 shadow-sm p-7 sm:p-10 space-y-6">
          <div className="text-center">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 items-center justify-center text-blue-600 mb-3.5 shadow-xs">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Registrasi Akun Siswa Baru
            </h1>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Lengkapi formulir di bawah ini untuk memulai bimbingan belajar
            </p>
          </div>

          {/* Banner Error */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200/60 rounded-2xl flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{errorMessage}</div>
            </div>
          )}

          {/* State Loading / Memuat saat proses registrasi dan penulisan Firestore */}
          {isSubmitting && (
            <div className="p-3.5 bg-blue-50 border border-blue-200/60 rounded-2xl flex items-center gap-3 text-xs text-blue-700 animate-pulse">
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
              <span className="font-semibold">{statusText || "Sedang mendaftarkan akun..."}</span>
            </div>
          )}

          {/* Tombol Cepat Google Sign-Up */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50/80 font-semibold text-xs text-slate-700 shadow-xs transition-all active:scale-95 duration-150 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Masuk dengan Google</span>
            </button>
          </div>

          {/* Pemisah atau */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200/70 w-full" />
            <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider absolute">
              atau via email
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Nama Lengkap Siswa <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  placeholder="Contoh: Muhammad Fadhil"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/60 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Alamat Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  placeholder="fadhil@gmail.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/60 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Nomor HP Siswa (WA)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                  <input
                    type="tel"
                    name="noHp"
                    value={formData.noHp}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    placeholder="081234567890"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/60 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Diawali 08, 10–13 digit angka</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Nomor HP Orang Tua
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                  <input
                    type="tel"
                    name="noHpOrangTua"
                    value={formData.noHpOrangTua}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    placeholder="081234567890"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/60 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Diawali 08, 10–13 digit angka</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Asal Sekolah / Tingkat
              </label>
              <div className="relative">
                <School className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  name="sekolah"
                  value={formData.sekolah}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="Contoh: SMAN 5 Surabaya (Kelas 12)"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/60 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Kata Sandi <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  placeholder="Minimal 6 karakter"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/60 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Kata sandi Anda dienkripsi aman oleh Firebase Authentication.
              </p>
            </div>

            <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200/60 text-[11px] text-blue-700 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                Setelah pendaftaran berhasil, Anda dapat langsung login dan memilih program bimbingan belajar yang diinginkan.
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all active:scale-95 duration-150 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mendaftarkan Akun...</span>
                </>
              ) : (
                <>
                  <span>Buat Akun Siswa Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            Sudah memiliki akun terdaftar?{" "}
            <Link href="/masuk" className="text-blue-600 font-semibold hover:underline">
              Masuk di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
