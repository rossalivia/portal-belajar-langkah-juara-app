"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { useData } from "../../context/DataContext";
import { db } from "../../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import {
  User,
  Mail,
  Phone,
  School,
  MapPin,
  Shield,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function ProfilPage() {
  const { authUser, userProfile, currentUser, showToast } = useData();

  const NO_HP_REGEX = /^08[0-9]{8,11}$/;

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    noHp: "",
    noHpOrangTua: "",
    sekolah: "",
    alamat: "",
  });

  const [errors, setErrors] = useState({
    noHp: "",
    noHpOrangTua: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        nama: userProfile.nama || "",
        email: userProfile.email || authUser?.email || "",
        noHp: userProfile.noHp || userProfile.telepon || "",
        noHpOrangTua: userProfile.noHpOrangTua || "",
        sekolah: userProfile.sekolah || "",
        alamat: userProfile.alamat || "",
      });
    }
  }, [userProfile, authUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Reset error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validatePhone = (value, fieldLabel) => {
    if (!value || !value.trim()) return "";
    const trimmed = value.trim();
    if (!NO_HP_REGEX.test(trimmed)) {
      return `${fieldLabel} tidak valid. Wajib berupa angka 10–13 digit dan diawali 08 (contoh: 081234567890).`;
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const noHpError = validatePhone(formData.noHp, "Nomor HP Siswa");
    const noHpOrangTuaError = validatePhone(formData.noHpOrangTua, "Nomor HP Orang Tua");

    if (noHpError || noHpOrangTuaError) {
      setErrors({
        noHp: noHpError,
        noHpOrangTua: noHpOrangTuaError,
      });
      showToast("Terdapat kesalahan format nomor HP. Silakan periksa kembali.", "error");
      return;
    }

    if (!authUser?.uid) {
      showToast("Sesi autentikasi tidak ditemukan. Silakan login ulang.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const userRef = doc(db, "users", authUser.uid);
      const updatedFields = {
        nama: formData.nama.trim(),
        noHp: formData.noHp.trim(),
        telepon: formData.noHp.trim(), // Kompatibilitas mundur
        noHpOrangTua: formData.noHpOrangTua.trim(),
        sekolah: formData.sekolah.trim(),
        alamat: formData.alamat.trim(),
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(userRef, updatedFields);
      showToast("Profil berhasil diperbarui dan tersimpan di database!", "success");
    } catch (err) {
      console.error("Gagal memperbarui profil:", err);
      showToast("Gagal menyimpan profil: " + err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "staf":
        return "Staf Admisi Bimbel";
      case "tutor":
        return "Tutor Pengajar";
      case "super_admin":
        return "Super Administrator";
      case "siswa":
      default:
        return "Siswa Bimbingan";
    }
  };

  return (
    <DashboardLayout
      title="Profil & Pengaturan Akun"
      subtitle="Kelola informasi identitas diri, nomor kontak siswa, dan data wali murid Anda."
    >
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Ringkasan Profil Card */}
        <div className="bg-white rounded-3xl border border-slate-200/60 p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
            {currentUser?.avatar || "US"}
          </div>

          <div className="text-center sm:text-left flex-1 min-w-0">
            <h2 className="text-lg font-bold text-slate-900 truncate">
              {formData.nama || "Pengguna Portal"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 truncate">{formData.email}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                <Shield className="w-3.5 h-3.5" />
                {getRoleLabel(userProfile?.role)}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Akun Aktif
              </span>
            </div>
          </div>
        </div>

        {/* Form Biodata & Validasi Nomor HP */}
        <div className="bg-white rounded-3xl border border-slate-200/60 p-6 md:p-8 shadow-xs">
          <div className="pb-4 mb-6 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              Data Pribadi & Informasi Kontak
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Pastikan nomor HP yang dimasukkan aktif pada layanan WhatsApp untuk koordinasi belajar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nama Lengkap */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
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
                  placeholder="Nama lengkap siswa"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/60 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Alamat Email (Akun Terdaftar)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-100/80 border border-slate-200/60 text-xs text-slate-500 cursor-not-allowed outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Alamat email terikat pada kredensial Firebase Authentication.
              </p>
            </div>

            {/* Nomor HP Siswa & Nomor HP Orang Tua (2 Kolom) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Nomor HP Siswa */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nomor HP Siswa (WA) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                  <input
                    type="tel"
                    name="noHp"
                    value={formData.noHp}
                    onChange={handleChange}
                    placeholder="081234567890"
                    className={`w-full pl-11 pr-4 py-3 rounded-xl bg-[#F2F2F7]/60 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all ${
                      errors.noHp
                        ? "border border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:bg-white"
                        : "border border-slate-200/60 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    }`}
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Format: Diawali <strong>08</strong>, 10–13 digit angka
                </p>
                {errors.noHp && (
                  <p className="text-xs text-rose-600 mt-1.5 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.noHp}
                  </p>
                )}
              </div>

              {/* Nomor HP Orang Tua */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nomor HP Orang Tua / Wali
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                  <input
                    type="tel"
                    name="noHpOrangTua"
                    value={formData.noHpOrangTua}
                    onChange={handleChange}
                    placeholder="081234567890"
                    className={`w-full pl-11 pr-4 py-3 rounded-xl bg-[#F2F2F7]/60 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all ${
                      errors.noHpOrangTua
                        ? "border border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:bg-white"
                        : "border border-slate-200/60 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    }`}
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Format: Diawali <strong>08</strong>, 10–13 digit angka
                </p>
                {errors.noHpOrangTua && (
                  <p className="text-xs text-rose-600 mt-1.5 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.noHpOrangTua}
                  </p>
                )}
              </div>
            </div>

            {/* Asal Sekolah */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Asal Sekolah & Kelas
              </label>
              <div className="relative">
                <School className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  name="sekolah"
                  value={formData.sekolah}
                  onChange={handleChange}
                  placeholder="Contoh: SMAN 1 Jakarta (Kelas 12)"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/60 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Alamat Domisili */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Alamat Tempat Tinggal
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <textarea
                  rows={3}
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleChange}
                  placeholder="Alamat domisili lengkap..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#F2F2F7]/60 border border-slate-200/60 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                />
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all active:scale-95 duration-150 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan Perubahan...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Simpan Perubahan Profil</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
