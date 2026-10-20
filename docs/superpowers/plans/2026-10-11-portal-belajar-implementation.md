# Portal Belajar Langkah Juara Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun web application LMS Portal Belajar Langkah Juara menggunakan Next.js (App Router, JavaScript, Tailwind CSS) dengan seluruh halaman Bab 4 PRD, UI/UX Bab 5 PRD, dan mock state interaktif 7 koleksi data tanpa login/route guard.

**Architecture:** Menggunakan Next.js App Router dengan layout modular per role (`/`, `/masuk`, `/daftar`, `/beranda/*`, `/staf/*`, `/tutor/*`, `/admin/*`). Data disimpan dan disinkronkan melalui React Context (`DataContext`) yang tersinkron ke `localStorage` dengan initial seed data realistis, dilengkapi komponen reusable (Navbar, Sidebar, StatCard, DataTable, Modal, Toast Notification).

**Tech Stack:** Next.js (App Router, JavaScript), React 19/18, Tailwind CSS, Lucide React (ikonografi).

**Spec:** [Spesifikasi Desain](file:///c:/Users/ASUS/Documents/Bootcamp%20Web%20Pro%20PLAN/bootcamp/portal-belajar-langkah-juara-app/portal-belajar-langkah-juara-app/docs/superpowers/specs/2026-10-11-portal-belajar-design.md)

## Global Constraints
- Framework: Next.js App Router dengan JavaScript (JSX) dan Tailwind CSS.
- Rute wajib persis Bab 4 PRD:
  - Publik: `/masuk`, `/daftar` (serta landing `/` untuk switch/akses mudah).
  - Siswa: `/beranda`, `/beranda/program`, `/beranda/tugas`, `/beranda/nilai`.
  - Staf: `/staf`, `/staf/pendaftaran`, `/staf/kelas`.
  - Tutor: `/tutor`, `/tutor/tugas`, `/tutor/penilaian`.
  - Admin: `/admin`, `/admin/pengguna`.
- Tanpa login & tanpa route guard: Seluruh halaman langsung dapat dibuka dan ditelusuri.
- Memenuhi prinsip UI/UX Bab 5 PRD: sans-serif modern, hierarchy teks jelas, visual feedback toast, skeleton loading / empty state grafis dengan CTA.

## Review Focus
1. Sinkronisasi data antar modul: Aksi pendaftaran di `/beranda/program` langsung muncul di `/staf/pendaftaran`, dan persetujuan staf langsung memperbarui status siswa.
2. Penempatan kelas: Siswa yang disetujui staf di `/staf/kelas` terhubung ke kelas tutor yang sesuai.
3. Alur tugas dan penilaian: Tugas yang dibuat tutor di `/tutor/tugas` tampil di `/beranda/tugas`, jawaban siswa tampil di `/tutor/penilaian`, dan penilaian tutor muncul di `/beranda/nilai`.
4. Ketersediaan semua rute: Memastikan tidak ada rute Bab 4 yang 404 saat diakses langsung via URL.
5. Responsivitas dan tampilan: Tampilan modern, bersih, bebas broken style pada layar desktop dan mobile.

---

### Task 1: Scaffolding Proyek Next.js & Konfigurasi Tailwind CSS
**Files:**
- Create/Initialize: `package.json`, `next.config.mjs`, `tailwind.config.js`, `postcss.config.js`, `src/app/globals.css`, `src/app/layout.js`
- Test: Build / dev startup check

- [x] **Step 1: Inisialisasi dependensi Next.js, React, Tailwind CSS, lucide-react**
- [x] **Step 2: Konfigurasi Tailwind CSS dan font styling di `src/app/globals.css`**
- [x] **Step 3: Setup Root Layout dengan DataProvider wrapper dan Toast container**
- [x] **Step 4: Jalankan build check untuk memastikan konfigurasi bebas error**

---

### Task 2: Mock State Management (DataContext & Seed Data)
**Files:**
- Create: `src/context/DataContext.jsx`
- Create: `src/data/seedData.js`
- Create: `src/components/Toast.jsx`

- [x] **Step 1: Buat seed data 7 koleksi Firestore (`users`, `program`, `pendaftaran`, `kelas`, `tugas`, `pengumpulan`, `penilaian`)**
- [x] **Step 2: Implementasi DataContext dengan reducer/action hooks (addPendaftaran, updatePendaftaranStatus, assignSiswaKelas, addTugas, submitTugas, gradeTugas, updateUserRole, resetData)**
- [x] **Step 3: Implementasi Toast notification context & visual toast alert**

---

### Task 3: Komponen Layout & Navigasi Reusable (App Shell & Role Switcher)
**Files:**
- Create: `src/components/Navbar.jsx`
- Create: `src/components/Sidebar.jsx`
- Create: `src/components/DashboardLayout.jsx`
- Create: `src/components/StatCard.jsx`
- Create: `src/components/EmptyState.jsx`

- [x] **Step 1: Buat Sidebar dinamis yang menyesuaikan menu aktif berdasarkan role/modul saat ini**
- [x] **Step 2: Buat Navbar dengan info profil simulasi dan Quick Role Switcher agar pengguna mudah berpindah ke Siswa/Staf/Tutor/Admin/Publik kapan saja**
- [x] **Step 3: Buat reusable StatCard dan EmptyState dengan CTA interaktif**

---

### Task 4: Halaman Publik & Landing (`/`, `/masuk`, `/daftar`)
**Files:**
- Create: `src/app/page.js`
- Create: `src/app/masuk/page.js`
- Create: `src/app/daftar/page.js`

- [x] **Step 1: Implementasi `/` sebagai Landing & Navigation Hub terpadu untuk showcase semua modul Bab 4**
- [x] **Step 2: Implementasi `/masuk` dengan form login email/password, Google auth dummy, dan tombol cepat langsung masuk ke role manapun**
- [x] **Step 3: Implementasi `/daftar` dengan form registrasi akun siswa baru yang langsung terdaftar ke DataContext dengan notifikasi toast**

---

### Task 5: Modul Siswa (`/beranda`, `/beranda/program`, `/beranda/tugas`, `/beranda/nilai`)
**Files:**
- Create: `src/app/beranda/page.js`
- Create: `src/app/beranda/program/page.js`
- Create: `src/app/beranda/tugas/page.js`
- Create: `src/app/beranda/nilai/page.js`

- [x] **Step 1: Buat `/beranda` dengan metrik kemajuan belajar, status kelas, tugas mendatang, dan grafik ringkasan**
- [x] **Step 2: Buat `/beranda/program` dengan kartu pilihan program dan formulir pengajuan keikutsertaan bimbel serta riwayat status pendaftaran**
- [x] **Step 3: Buat `/beranda/tugas` dengan filter tab (Semua, Belum Dikerjakan, Selesai), modal pengumpulan jawaban/lampiran**
- [x] **Step 4: Buat `/beranda/nilai` dengan kartu dan tabel nilai tugas, umpan balik tutor, dan rata-rata skor**

---

### Task 6: Modul Staf (`/staf`, `/staf/pendaftaran`, `/staf/kelas`)
**Files:**
- Create: `src/app/staf/page.js`
- Create: `src/app/staf/pendaftaran/page.js`
- Create: `src/app/staf/kelas/page.js`

- [x] **Step 1: Buat `/staf` dengan analitik pendaftaran aktif, kuota kelas, dan metrik operasional**
- [x] **Step 2: Buat `/staf/pendaftaran` dengan tabel interaktif permohonan pendaftaran siswa, tombol setujui / tolak instan, dan filter status**
- [x] **Step 3: Buat `/staf/kelas` dengan modul alokasi penempatan siswa yang telah disetujui ke dalam kelas dan penunjukan tutor**

---

### Task 7: Modul Tutor (`/tutor`, `/tutor/tugas`, `/tutor/penilaian`)
**Files:**
- Create: `src/app/tutor/page.js`
- Create: `src/app/tutor/tugas/page.js`
- Create: `src/app/tutor/penilaian/page.js`

- [x] **Step 1: Buat `/tutor` dengan dasbor grafik partisipasi pengumpulan tugas, rekap kelas yang diampu, dan tugas aktif**
- [x] **Step 2: Buat `/tutor/tugas` dengan form pembuatan tugas baru (judul, deskripsi rich format, kelas, tenggat waktu) dan daftar tugas aktif**
- [x] **Step 3: Buat `/tutor/penilaian` dengan antarmuka grading untuk input skor 0-100 dan umpan balik edukatif pada pengumpulan tugas siswa**

---

### Task 8: Modul Super Admin (`/admin`, `/admin/pengguna`)
**Files:**
- Create: `src/app/admin/page.js`
- Create: `src/app/admin/pengguna/page.js`

- [x] **Step 1: Buat `/admin` dengan grafik agregat pertumbuhan pengguna, distribusi peran, dan tren pendaftaran sistem**
- [x] **Step 2: Buat `/admin/pengguna` dengan tabel manajemen profil pengguna, filter role, pencarian, dan modal ubah role (`siswa`, `staf`, `tutor`, `super_admin`)**

---

### Task 9: Verifikasi, Testing Alur End-to-End & Polish UI/UX
- [x] **Step 1: Jalankan `npm run build` untuk memvalidasi tidak ada syntax/import error di semua rute**
- [x] **Step 2: Verifikasi seluruh 14 rute Bab 4 PRD dapat diakses langsung tanpa error**
- [x] **Step 3: Uji simulasi alur end-to-end: Daftar -> Disetujui -> Masuk Kelas -> Tugas -> Kumpul -> Nilai**
- [x] **Step 4: Periksa kepatuhan estetika Bab 5 (skeleton/empty states, CTA, toast, responsivitas)**
