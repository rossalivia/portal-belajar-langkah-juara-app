# Spesifikasi Desain & Arsitektur: Portal Belajar Langkah Juara

**Tanggal**: 2026-10-11  
**Status**: Disetujui  
**Lingkup**: Pembuatan prototipe fungsional Next.js (App Router, JavaScript, Tailwind CSS) berbasis PRD Portal Belajar Langkah Juara tanpa login & route guard.

---

## 1. Ringkasan Eksekutif & Tujuan

Membangun web application Portal Belajar Langkah Juara dengan framework **Next.js (App Router, JavaScript, Tailwind CSS)** yang mengimplementasikan seluruh modul dan route di **Bab 4 PRD**, menerapkan prinsip UI/UX modern di **Bab 5**, dengan interaktivitas simulasi data (mock state berbasis Context/LocalStorage) mencakup 7 koleksi Firestore di **Bab 7**, tanpa batasan autentikasi login atau penjagaan halaman (route guard) agar seluruh halaman dapat diakses dan diuji langsung.

---

## 2. Struktur Route (Persis Bab 4 PRD)

### 2.1 Navigasi Utama & Landing
- `/`: Beranda utama portal / Hub Navigasi cepat ke seluruh role (Siswa, Staf, Tutor, Admin, Publik) untuk kemudahan navigasi & demo.

### 2.2 Akses Publik (Pengunjung)
- `/masuk`: Halaman Masuk (Email/Password & Google Auth mock, beralih ke form atau dasbor).
- `/daftar`: Halaman Pendaftaran Akun Baru Siswa dengan form input lengkap dan feedback toast.

### 2.3 Modul Siswa
- `/beranda`: Dasbor utama siswa dengan metrik progres belajar, status program aktif, ringkasan tugas aktif, dan grafik perkembangan.
- `/beranda/program`: Formulir pendaftaran program bimbel (pilihan program, status pengajuan "menunggu/disetujui/ditolak").
- `/beranda/tugas`: Daftar tugas siswa dengan filter tab (Semua, Belum Dikerjakan, Selesai), modal/form pengumpulan tugas, dan link/teks lampiran.
- `/beranda/nilai`: Rangkuman nilai tugas beserta feedback/catatan edukatif dari tutor.

### 2.4 Modul Staf
- `/staf`: Dasbor staf dengan ringkasan analitik pendaftaran aktif, statistik kuota kelas, dan aktivitas terbaru.
- `/staf/pendaftaran`: Tabel interaktif pendaftaran siswa dengan aksi persetujuan (`disetujui`) atau penolakan (`ditolak`) instan.
- `/staf/kelas`: Manajemen penempatan siswa yang telah disetujui ke dalam kelas dan penugasan tutor.

### 2.5 Modul Tutor
- `/tutor`: Dasbor tutor dengan grafik partisipasi pengumpulan tugas, statistik tugas aktif, dan ringkasan kelas yang dibimbing.
- `/tutor/tugas`: Antarmuka manajemen & pembuatan tugas baru dengan editor deskripsi, kelas target, dan tenggat waktu.
- `/tutor/penilaian`: Antarmuka penilaian (*grading*) untuk memberikan nilai angka (0-100) dan umpan balik tertulis pada jawaban siswa.

### 2.6 Modul Super Admin
- `/admin`: Dasbor sentral dengan analitik agregat pertumbuhan pengguna, distribusi peran, dan tren pendaftaran.
- `/admin/pengguna`: Manajemen pengguna untuk pencarian, filter, dan pengubahan role pengguna (`siswa`, `staf`, `tutor`, `super_admin`).

---

## 3. Desain Antarmuka & UX (Sesuai Bab 5 PRD)

1. **Tipografi & Desain Visual**:
   - Modern Sans-serif (Inter / System font) dengan kontras tinggi, hierarki heading jelas.
   - Palet warna profesional bimbel: Deep Indigo/Blue primer, Emerald sukses, Amber peringatan, Rose bahaya, Slate netral.
   - Glassmorphic card accents, border halus, bayangan modern, dan responsive design (mobile, tablet, desktop).
2. **Navigasi Bersama (Navbar & Sidebar Layout)**:
   - Sidebar navigasi yang konsisten sesuai modul/role saat ini, dilengkapi dropdown cepat untuk berganti peran/halaman tanpa login.
   - Header atas dengan notifikasi dummy, pencarian global, dan profil simulasi.
3. **Komponen Interaktif & State Management**:
   - **Feedback Visual**: Notifikasi Toast instan untuk aksi (simpan tugas, ubah role, kumpul tugas, persetujuan pendaftaran).
   - **Empty States**: Grafis ilustratif ikonik dengan tombol aksi Call-to-Action (CTA) saat data belum ada.
   - **Skeleton Loading**: Tampilan placeholder shimmer saat filter atau pergantian tab.
   - **Modal Dialogs**: Dialog form interaktif untuk buat tugas, kumpul tugas, beri nilai, ubah role, dan tambah pendaftaran.

---

## 4. State Management & Data Schema (Bab 7 PRD)

Data dikelola menggunakan **React Context (`DataContext`)** yang tersimpan di `localStorage` dengan inisialisasi *seed data* realistis untuk 7 entitas:
1. `users`: Siswa, Staf, Tutor, Super Admin.
2. `program`: Pilihan program bimbel (SNBT Juara, Kedinasan Unggul, Reguler SMA/SMP).
3. `pendaftaran`: Data pendaftaran siswa ke program dengan status `menunggu`, `disetujui`, `ditolak`.
4. `kelas`: Daftar kelas, nama tutor, dan daftar ID siswa anggota.
5. `tugas`: Daftar tugas per kelas dengan judul, deskripsi, tenggat waktu.
6. `pengumpulan`: Pengumpulan jawaban siswa per tugas dengan timestamp dan status.
7. `penilaian`: Nilai angka dan umpan balik edukatif tutor terhadap pengumpulan tugas.

Semua aksi CRUD (tambah pendaftaran, verifikasi pendaftaran, tempatkan kelas, tambah tugas, kumpulkan tugas, beri nilai, ubah role) memperbarui state secara reaktif sehingga perubahan di modul Staf/Tutor langsung tercermin di modul Siswa dan sebaliknya.

---

## 5. Rencana Eksekusi & Tahapan

1. Inisialisasi scaffolding Next.js (App Router, Tailwind CSS, Lucide Icons, Chart.js / Recharts jika diperlukan).
2. Konfigurasi Tailwind CSS dan layout dasar (Global CSS, layout wrapper, Navbar, Sidebar).
3. Implementasi `DataProvider` dengan mock data lengkap 7 koleksi Firestore.
4. Implementasi Halaman Publik: `/`, `/masuk`, `/daftar`.
5. Implementasi Modul Siswa: `/beranda`, `/beranda/program`, `/beranda/tugas`, `/beranda/nilai`.
6. Implementasi Modul Staf: `/staf`, `/staf/pendaftaran`, `/staf/kelas`.
7. Implementasi Modul Tutor: `/tutor`, `/tutor/tugas`, `/tutor/penilaian`.
8. Implementasi Modul Super Admin: `/admin`, `/admin/pengguna`.
9. Verifikasi seluruh link rute Bab 4 dan fungsionalitas UI/UX Bab 5.
