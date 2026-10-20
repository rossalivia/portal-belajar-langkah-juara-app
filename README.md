# 🎓 Portal Belajar Langkah Juara - Learning Management System (LMS)

[![Next.js](https://img.shields.io/badge/Next.js-14.2.24-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-orange?style=flat&logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4.17-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![PRD Compliance](https://img.shields.io/badge/PRD%20Compliance-Bab%201--8%20100%25-emerald?style=flat)]()

**Portal Belajar Langkah Juara** adalah platform *Learning Management System* (LMS) modern berbasis web yang mengintegrasikan administrasi pendaftaran, alokasi rombongan belajar, distribusi penugasan, dan penilaian edukatif ke dalam satu ekosistem terpadu.

Aplikasi ini dibangun menggunakan arsitektur **Next.js 14 (App Router)**, didukung **Google Cloud Firestore (Real-time Snapshot Listener)** dan **Firebase Authentication**, serta dirancang dengan prinsip antarmuka berstandar korporat modern (Inter & Plus Jakarta Sans, card-based layout, toast feedback, skeleton state, dan responsivitas mobile).

---

## 📌 Daftar Isi
1. [Struktur Folder & Navigasi](#-struktur-folder--navigasi)
2. [Fitur Unggulan](#-fitur-unggulan)
3. [Peran Pengguna (4 Roles)](#-peran-pengguna-4-roles)
4. [Struktur Skema Firestore (7 Koleksi Utama)](#-struktur-skema-firestore-7-koleksi-utama)
5. [Matriks Pengujian Hak Akses (16 Skenario Matriks)](#-matriks-pengujian-hak-akses-16-skenario-matriks)
6. [Panduan Menjalankan Aplikasi](#-panduan-menjalankan-aplikasi)
7. [Panduan Uji Alur Bisnis End-to-End](#-panduan-uji-alur-bisnis-end-to-end)

---

## 📂 Struktur Folder & Navigasi

> ⚠️ **Catatan Penting Menjalankan Aplikasi:**  
> Proyek aplikasi berada di dalam subdirektori `portal-belajar-langkah-juara-app`. Pastikan Anda berpindah ke subdirektori tersebut sebelum menjalankan perintah npm:
> ```bash
> cd portal-belajar-langkah-juara-app
> npm run dev
> ```

### Pemetaan Rute Bab 4 PRD:
- **Akses Publik**:
  - `/` : Landing Page & Showcase Seluruh Modul
  - `/masuk` : Halaman Masuk (Email/Password & Google Auth)
  - `/daftar` : Formulir Registrasi Akun Siswa Baru
- **Modul Siswa (`/beranda/*`)**:
  - `/beranda` : Dasbor Utama Siswa (Metrik Progres, Status Pengajuan & Tugas Aktif)
  - `/beranda/program` : Katalog & Formulir Pengajuan Keikutsertaan Program
  - `/beranda/tugas` : Daftar Tugas Terisolasi & Modal Pengumpulan Jawaban
  - `/beranda/nilai` : Rangkuman Nilai & Umpan Balik Edukatif Tutor
- **Modul Staf Admisi (`/staf/*`)**:
  - `/staf` : Dasbor Operasional Admisi & Statistik Pendaftaran
  - `/staf/pendaftaran` : Tabel Verifikasi Persetujuan / Penolakan Pendaftaran Siswa
  - `/staf/kelas` : Modul Penempatan Siswa yang Disetujui ke Rombongan Belajar
- **Modul Tutor (`/tutor/*`)**:
  - `/tutor` : Dasbor Tutor & Metrik Partisipasi Siswa
  - `/tutor/tugas` : Antarmuka Penerbitan Tugas Baru dengan Tenggat & Bobot Nilai
  - `/tutor/penilaian` : Antarmuka Grading (Skor 0-100 & Umpan Balik Tertulis)
- **Modul Super Admin (`/admin/*`)**:
  - `/admin` : Dasbor Sentral Analitik Platform & Pertumbuhan Pengguna
  - `/admin/pengguna` : Manajemen Hak Akses Pengguna (Ubah Role Real-time)

---

## ✨ Fitur Unggulan

1. **Sinkronisasi Data Real-time Firestore**:  
   Semua mutasi data (pendaftaran, persetujuan staf, pembuatan tugas, pengumpulan, penilaian, dan perubahan role) disinkronkan secara langsung menggunakan `onSnapshot` Firestore tanpa reload halaman.
2. **Kerahasiaan Data Siswa (*Data Isolation*)**:  
   Siswa hanya dapat melihat dan mengumpulkan tugas dari rombongan belajar di mana siswa tersebut telah ditempatkan. Tidak ada kebocoran tugas antar-siswa.
3. **Isolasi Kelas Tutor**:  
   Tutor hanya mengelola dan menilai tugas untuk rombongan belajar yang diampunya. Super Admin memiliki hak visibilitas penuh ke seluruh kelas.
4. **Route Guard Berlapis & Halaman 403 Informatif**:  
   Sistem memeriksa sesi Firebase Auth dan profil Firestore pengguna. Pengguna yang mencoba menembus rute di luar perannya otomatis dihadang oleh layar **403 Access Denied** yang menyajikan konteks peran pengguna, rute diminta, peran yang diizinkan, serta tombol kembali ke dasbor yang sesuai.
5. **Navigasi Responsif Desktop & Mobile**:  
   Dilengkapi Sidebar dinamis di desktop dan Mobile Drawer Hamburger interaktif di smartphone lengkap dengan switcher modul dan sub-navigasi halaman.
6. **Keamanan Autentikasi**:  
   Kata sandi diproses eksklusif oleh Firebase Authentication dan **tidak pernah disimpan** dalam dokumen profil Firestore.

---

## 👥 Peran Pengguna (4 Roles)

| Peran | Kode Role | Akses Utama | Tanggung Jawab |
| :--- | :--- | :--- | :--- |
| **Siswa** | `siswa` | `/beranda/*` | Mengajukan program, mengerjakan & mengumpulkan tugas kelas, melihat nilai dan catatan tutor. |
| **Staf Admisi** | `staf` | `/staf/*` | Memverifikasi berkas pendaftaran calon siswa, menyetujui/menolak, dan menempatkan siswa ke kelas. |
| **Tutor** | `tutor` | `/tutor/*` | Mengelola kelas yang diampu, menerbitkan tugas latihan/tryout, menilai jawaban dan memberikan catatan. |
| **Super Admin** | `super_admin` | `/admin/*` + seluruh modul | Memantau kesehatan platform agregat dan mengubah hak akses/peran pengguna di database. |

---

## 🗄️ Struktur Skema Firestore (7 Koleksi Utama)

1. **`users`** (`users/{uid}`)
   - `id`: string (UID Firebase Auth)
   - `nama`: string
   - `email`: string
   - `role`: string (`siswa` | `staf` | `tutor` | `super_admin`)
   - `avatar`: string
   - `telepon`: string
   - `sekolah`: string (khusus siswa)
   - `createdAt`: ISO Timestamp string
2. **`program`**
   - `id`: string
   - `nama`: string
   - `deskripsi`: string
   - `durasi`: string
   - `target`: string
   - `biaya`: string
   - `fasilitas`: array of string
3. **`pendaftaran`**
   - `id`: string
   - `siswaId`: string (referensi ke `users.id`)
   - `programId`: string (referensi ke `program.id`)
   - `status`: string (`menunggu` | `disetujui` | `ditolak`)
   - `tanggalDaftar`: ISO Timestamp string
   - `catatan`: string
4. **`kelas`**
   - `id`: string
   - `nama`: string
   - `tutorId`: string (referensi ke `users.id`)
   - `siswaIds`: array of string (daftar `users.id` siswa)
   - `jadwal`: string
   - `ruang`: string
5. **`tugas`**
   - `id`: string
   - `kelasId`: string (referensi ke `kelas.id`)
   - `judul`: string
   - `deskripsi`: string
   - `tenggatWaktu`: ISO Timestamp string
   - `bobotNilai`: number
   - `createdAt`: ISO Timestamp string
6. **`pengumpulan`**
   - `id`: string
   - `tugasId`: string (referensi ke `tugas.id`)
   - `siswaId`: string (referensi ke `users.id`)
   - `jawaban`: string (teks esai atau URL Google Drive)
   - `tanggalKumpul`: ISO Timestamp string
7. **`penilaian`**
   - `id`: string
   - `pengumpulanId`: string (referensi ke `pengumpulan.id`)
   - `nilai`: number (skor 0 - 100)
   - `catatanTutor`: string (umpan balik edukatif)
   - `tanggalNilai`: ISO Timestamp string

---

## 🛡️ Matriks Pengujian Hak Akses (16 Skenario Matriks)

Sesuai ketentuan **PRD Bab 8**, berikut adalah matriks hasil pengujian proteksi rute:

| Skenario | Peran Pengguna Aktif | Rute yang Dituju | Hasil yang Diharapkan | Status Hasil Uji |
| :---: | :--- | :--- | :--- | :---: |
| **1** | Siswa (`siswa`) | `/beranda/*` | Diizinkan (Status 200) | ✅ Lolos |
| **2** | Siswa (`siswa`) | `/staf/*` | Dihadang: Layar 403 Akses Ditolak | ✅ Lolos |
| **3** | Siswa (`siswa`) | `/tutor/*` | Dihadang: Layar 403 Akses Ditolak | ✅ Lolos |
| **4** | Siswa (`siswa`) | `/admin/*` | Dihadang: Layar 403 Akses Ditolak | ✅ Lolos |
| **5** | Staf Admisi (`staf`) | `/beranda/*` | Dihadang: Layar 403 Akses Ditolak | ✅ Lolos |
| **6** | Staf Admisi (`staf`) | `/staf/*` | Diizinkan (Status 200) | ✅ Lolos |
| **7** | Staf Admisi (`staf`) | `/tutor/*` | Dihadang: Layar 403 Akses Ditolak | ✅ Lolos |
| **8** | Staf Admisi (`staf`) | `/admin/*` | Dihadang: Layar 403 Akses Ditolak | ✅ Lolos |
| **9** | Tutor (`tutor`) | `/beranda/*` | Dihadang: Layar 403 Akses Ditolak | ✅ Lolos |
| **10** | Tutor (`tutor`) | `/staf/*` | Dihadang: Layar 403 Akses Ditolak | ✅ Lolos |
| **11** | Tutor (`tutor`) | `/tutor/*` | Diizinkan (Status 200) | ✅ Lolos |
| **12** | Tutor (`tutor`) | `/admin/*` | Dihadang: Layar 403 Akses Ditolak | ✅ Lolos |
| **13** | Super Admin (`super_admin`) | `/beranda/*` | Diizinkan (Status 200) | ✅ Lolos |
| **14** | Super Admin (`super_admin`) | `/staf/*` | Diizinkan (Status 200) | ✅ Lolos |
| **15** | Super Admin (`super_admin`) | `/tutor/*` | Diizinkan (Status 200) | ✅ Lolos |
| **16** | Super Admin (`super_admin`) | `/admin/*` | Diizinkan (Status 200) | ✅ Lolos |
| **Tambahan** | Belum Login (`null`) | Semua rute terproteksi | Dialihkan otomatis ke `/masuk` | ✅ Lolos |

---

## 🚀 Panduan Menjalankan Aplikasi

### 1. Prasyarat Sistem
- Node.js versi 18.17 atau lebih baru
- npm / yarn / pnpm

### 2. Pemasangan & Menjalankan Server Development
```bash
# 1. Navigasi ke direktori aplikasi
cd portal-belajar-langkah-juara-app

# 2. Instalasi seluruh dependensi
npm install

# 3. Jalankan server lokal Next.js
npm run dev
```

Buka peramban di `http://localhost:3000`.

### 3. Melakukan Build Produksi
```bash
npm run build
npm run start
```

---

## 🧪 Panduan Uji Alur Bisnis End-to-End

Untuk memvalidasi kelengkapan sistem sesuai skenario penuh di PRD, ikuti langkah pengujian berikut:

1. **Pendaftaran Akun Baru Siswa**:
   - Buka `/daftar`, masukkan nama, email, nomor telepon, asal sekolah, dan kata sandi minimal 6 karakter.
   - Klik **Daftar Akun Siswa**. Akun otomatis terdaftar di Firebase Auth dan Firestore dengan role `siswa`, lalu diarahkan ke `/beranda`.
2. **Pengajuan Program Belajar**:
   - Buka `/beranda/program`, pilih program bimbel (misal: *Program Intensif SNBT Juara 2026*), lalu klik **Ajukan Program**.
   - Status pengajuan masuk ke status `MENUNGGU`.
3. **Persetujuan oleh Staf Admisi**:
   - Masuk sebagai akun Staf (atau ubah role akun Anda melalui Admin di `/admin/pengguna` menjadi `staf`).
   - Buka `/staf/pendaftaran`. Pengajuan siswa tadi akan muncul di tabel.
   - Klik **Setujui** untuk memverifikasi pendaftaran siswa.
4. **Penempatan Siswa ke Kelas**:
   - Buka `/staf/kelas`. Pilih kelas yang tersedia (misal: *Kelas SNBT Alpha*).
   - Pada dropdown siswa yang disetujui, pilih siswa baru tersebut dan klik **Tambahkan Siswa ke Kelas**.
5. **Pembuatan Tugas oleh Tutor**:
   - Masuk sebagai Tutor penanggung jawab kelas tersebut.
   - Buka `/tutor/tugas`, klik **Buat Tugas Baru**, isi judul, petunjuk pengerjaan, bobot nilai, dan tenggat waktu. Klik **Terbitkan Tugas**.
6. **Pengumpulan Tugas oleh Siswa**:
   - Kembali ke akun Siswa, buka `/beranda/tugas`. Tugas kelas tadi kini langsung muncul secara terisolasi.
   - Klik **Kumpulkan Tugas**, ketikkan teks jawaban atau tautan Google Drive, lalu klik **Kirim Jawaban**.
7. **Penilaian & Umpan Balik oleh Tutor**:
   - Buka `/tutor/penilaian` pada akun Tutor. Pengumpulan jawaban siswa akan muncul.
   - Klik **Beri Nilai**, masukkan skor (misal: `95`) dan catatan edukatif konstruktif. Klik **Simpan Penilaian**.
8. **Evaluasi Nilai oleh Siswa**:
   - Buka `/beranda/nilai` pada akun Siswa. Skor angka, kartu predikat pencapaian, dan catatan tutor akan tertampil secara lengkap.
