"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import { useData } from "../../context/DataContext";
import { auth, db } from "../../lib/firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  GraduationCap,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function MasukPage() {
  const router = useRouter();
  const { authUser, userProfile, isLoadingAuth, showToast } = useData();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");

  // Redirect jika pengguna sudah dalam status login dan verifikasi profil selesai
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

  // Handler pengecekan dan sinkronisasi koleksi Firestore users/{uid}
  const handleUserFirestoreCheck = async (user) => {
    setStatusText("Memeriksa profil pengguna di database...");
    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);

    let role = "siswa";

    if (!docSnap.exists()) {
      // Bila dokumen belum ada, buat dokumen baru dengan field nama, email, role = 'siswa', dan aktif = true
      // DILARANG KERAS menyimpan kata sandi (password) di dalam dokumen Firestore!
      const newUserData = {
        nama: user.displayName || user.email?.split("@")[0] || "Siswa Baru",
        email: user.email,
        role: "siswa",
        aktif: true,
        createdAt: new Date().toISOString(),
      };
      await setDoc(userRef, newUserData);
      role = "siswa";
    } else {
      // Bila dokumen sudah ada, periksa status keaktifan akun
      const existingData = docSnap.data();
      if (existingData?.aktif === false) {
        await signOut(auth);
        throw new Error("Akun Anda dinonaktifkan. Hubungi staf Langkah Juara");
      }
      role = existingData?.role || "siswa";
    }

    return role;
  };

  // Navigasi sesuai role
  const navigateByRole = (role) => {
    setStatusText("Mengarahkan ke dasbor...");
    if (role === "staf") router.push("/staf");
    else if (role === "tutor") router.push("/tutor");
    else if (role === "super_admin" || role === "admin") router.push("/admin");
    else router.push("/beranda");
  };

  // 1. Masuk menggunakan Email dan Kata Sandi
  const handleSubmitEmailPassword = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsProcessing(true);
    setStatusText("Mengautentikasi akun...");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      const user = userCredential.user;

      // Cek dokumen Firestore users/{uid}
      const role = await handleUserFirestoreCheck(user);

      showToast(`Masuk berhasil! Selamat datang kembali.`, "success");
      navigateByRole(role);
    } catch (err) {
      console.error("Error login email/password:", err);
      let pesan = "Email atau kata sandi tidak valid. Silakan coba lagi.";
      if (err.message === "Akun Anda dinonaktifkan. Hubungi staf Langkah Juara") {
        pesan = err.message;
      } else if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      ) {
        pesan = "Email atau kata sandi salah. Silakan coba lagi.";
      } else if (err.code === "auth/invalid-email") {
        pesan = "Format alamat email tidak valid.";
      } else if (err.code === "auth/too-many-requests") {
        pesan = "Terlalu banyak percobaan gagal. Silakan coba lagi setelah beberapa saat.";
      } else if (err.message) {
        pesan = err.message;
      }
      setErrorMessage(pesan);
      setIsProcessing(false);
      setStatusText("");
    }
  };

  // 2. Masuk menggunakan Akun Google (SSO)
  const handleGoogleSignIn = async () => {
    setErrorMessage("");
    setIsProcessing(true);
    setStatusText("Menghubungkan ke Google Sign-In...");

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Cek koleksi users/{uid} di Firestore
      const role = await handleUserFirestoreCheck(user);

      showToast(`Berhasil masuk dengan akun Google: ${user.email}`, "success");
      navigateByRole(role);
    } catch (err) {
      console.error("Error login Google:", err);
      let pesan = "Gagal masuk dengan Google.";
      if (err.message === "Akun Anda dinonaktifkan. Hubungi staf Langkah Juara") {
        pesan = err.message;
      } else if (err.code === "auth/popup-closed-by-user") {
        pesan = "Jendela login Google ditutup sebelum selesai.";
      } else if (err.code === "auth/cancelled-popup-request") {
        pesan = "Permintaan login Google dibatalkan.";
      } else if (err.message) {
        pesan = err.message;
      }
      setErrorMessage(pesan);
      setIsProcessing(false);
      setStatusText("");
    }
  };

  // Jika sedang memeriksa sesi aktif pengguna yang sudah login
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
            Menyiapkan dasbor sesuai peran Anda
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F2F2F7]">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-5 sm:p-8">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/60 shadow-sm p-7 sm:p-10 space-y-6">
          <div className="text-center">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 items-center justify-center text-blue-600 mb-3.5 shadow-xs">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Masuk ke Portal
            </h1>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Gunakan Email atau Akun Google Anda untuk mengakses sistem
            </p>
          </div>

          {/* Banner Error jika ada kendala autentikasi */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200/60 rounded-2xl flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{errorMessage}</div>
            </div>
          )}

          {/* State Loading / Memuat saat proses login dan verifikasi Firestore */}
          {isProcessing && (
            <div className="p-3.5 bg-blue-50 border border-blue-200/60 rounded-2xl flex items-center gap-3 text-xs text-blue-700 animate-pulse">
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
              <span className="font-semibold">{statusText || "Sedang memproses..."}</span>
            </div>
          )}

          {/* Form Email & Password */}
          <form onSubmit={handleSubmitEmailPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isProcessing}
                  placeholder="nama@email.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/60 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Kata Sandi
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isProcessing}
                  placeholder="Masukkan kata sandi"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/60 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all active:scale-95 duration-150 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <span>Masuk Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Pemisah atau */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200/70 w-full" />
            <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider absolute">
              atau
            </span>
          </div>

          {/* Tombol Google Auth (SSO) */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isProcessing}
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

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            Belum punya akun siswa?{" "}
            <Link
              href="/daftar"
              className="text-blue-600 font-semibold hover:underline"
            >
              Daftar akun baru di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
