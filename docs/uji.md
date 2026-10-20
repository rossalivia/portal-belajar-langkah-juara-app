# DOKUMEN LAPORAN PENGUJIAN SISTEM & KEAMANAN (TEST REPORT)
**Portal Belajar Langkah Juara**

Dokumen ini mencatat matriks skenario pengujian komprehensif terhadap sistem proteksi rute (*Route Guard*), otorisasi multi-peran (RBAC), alur proses bisnis *end-to-end*, fitur lanjutan, serta integritas kompilasi produksi berdasarkan ketentuan **Product Requirements Document (PRD) Bab 1 s.d. Bab 8**.

---

## 1. Ringkasan Pelaksanaan Pengujian

* **Metode Pengujian**: *URL Direct Penetration Testing*, *End-to-End Business Flow Validation*, *Real-time Mutative State Testing*, dan *Production Build Verification*.
* **Lingkungan Pengujian**: Next.js 14 App Router, Google Cloud Firestore, Firebase Authentication (Local Server `http://localhost:3000`).
* **Basis Aturan Keamanan**: [`RouteGuard.jsx`](file:///c:/Users/ASUS/Documents/Bootcamp%20Web%20Pro%20PLAN/bootcamp/portal-belajar-langkah-juara-app/portal-belajar-langkah-juara-app/src/components/RouteGuard.jsx) & [`firestore.rules`](file:///c:/Users/ASUS/Documents/Bootcamp%20Web%20Pro%20PLAN/bootcamp/portal-belajar-langkah-juara-app/portal-belajar-langkah-juara-app/firestore.rules).
* **Hasil Pengujian**: 100% Skenario Terverifikasi Lolos (`[x]`). Build produksi sukses tanpa error (*Exit Code: 0*).

---

## 2. Tabel Pengujian Matriks Hak Akses (16 Skenario Inti PRD)

Format Kolom:
`No | Akun / Peran | Yang Dilakukan | Hasil yang Diharapkan | Status`

| No | Akun / Peran | Yang Dilakukan | Hasil yang Diharapkan | Status |
|:--:|:-------------|:---------------|:----------------------|:------:|
| 1 | Siswa (`siswa`) | Membuka rute Siswa (`/beranda`, `/beranda/program`, `/beranda/tugas`, `/beranda/nilai`, `/beranda/absen`, `/beranda/jadwal`, `/beranda/kuis`) | **Akses Diberikan**: Halaman dasbor siswa terbuka dengan data isolasi milik sendiri. | [x] Lolos |
| 2 | Siswa (`siswa`) | Mencoba membuka rute Staf (`/staf`, `/staf/pendaftaran`, `/staf/kelas`) | **Akses Ditolak**: Sistem memblokir dan menampilkan layar 403 "Akses Ditolak". | [x] Lolos |
| 3 | Siswa (`siswa`) | Mencoba membuka rute Tutor (`/tutor`, `/tutor/tugas`, `/tutor/penilaian`, `/tutor/absen`) | **Akses Ditolak**: Sistem memblokir dan menampilkan layar 403 "Akses Ditolak". | [x] Lolos |
| 4 | Siswa (`siswa`) | Mencoba membuka rute Admin (`/admin`, `/admin/pengguna`) | **Akses Ditolak**: Sistem memblokir dan menampilkan layar 403 "Akses Ditolak". | [x] Lolos |
| 5 | Staf (`staf`) | Mencoba membuka rute Siswa (`/beranda/*`) | **Akses Ditolak**: Sistem memblokir dan menampilkan layar 403 "Akses Ditolak". | [x] Lolos |
| 6 | Staf (`staf`) | Membuka rute Staf (`/staf`, `/staf/pendaftaran`, `/staf/kelas`) | **Akses Diberikan**: Dasbor staf terbuka, verifikasi berkas dan penempatan rombel berfungsi. | [x] Lolos |
| 7 | Staf (`staf`) | Mencoba membuka rute Tutor (`/tutor/*`) | **Akses Ditolak**: Sistem memblokir dan menampilkan layar 403 "Akses Ditolak". | [x] Lolos |
| 8 | Staf (`staf`) | Mencoba membuka rute Admin (`/admin/*`) | **Akses Ditolak**: Sistem memblokir dan menampilkan layar 403 "Akses Ditolak". | [x] Lolos |
| 9 | Tutor (`tutor`) | Mencoba membuka rute Siswa (`/beranda/*`) | **Akses Ditolak**: Sistem memblokir dan menampilkan layar 403 "Akses Ditolak". | [x] Lolos |
| 10 | Tutor (`tutor`) | Mencoba membuka rute Staf (`/staf/*`) | **Akses Ditolak**: Sistem memblokir dan menampilkan layar 403 "Akses Ditolak". | [x] Lolos |
| 11 | Tutor (`tutor`) | Membuka rute Tutor (`/tutor`, `/tutor/tugas`, `/tutor/penilaian`, `/tutor/absen`) | **Akses Diberikan**: Dasbor tutor terbuka, form tugas, grading, dan presensi berfungsi normal. | [x] Lolos |
| 12 | Tutor (`tutor`) | Mencoba membuka rute Admin (`/admin/*`) | **Akses Ditolak**: Sistem memblokir dan menampilkan layar 403 "Akses Ditolak". | [x] Lolos |
| 13 | Super Admin | Membuka rute Siswa (`/beranda/*`) | **Akses Diberikan**: Super admin diizinkan membuka seluruh modul siswa. | [x] Lolos |
| 14 | Super Admin | Membuka rute Staf (`/staf/*`) | **Akses Diberikan**: Super admin berwenang penuh membuka seluruh modul staf admisi. | [x] Lolos |
| 15 | Super Admin | Membuka rute Tutor (`/tutor/*`) | **Akses Diberikan**: Super admin berwenang penuh membuka seluruh modul pengajaran tutor. | [x] Lolos |
| 16 | Super Admin | Membuka rute Admin (`/admin`, `/admin/pengguna`) | **Akses Diberikan**: Dasbor sentral analitik platform dan manajemen pengguna terbuka penuh. | [x] Lolos |

---

## 3. Tabel Pengujian Fitur Lanjutan & Operasi Bisnis

| No | Modul / Fitur | Skenario Pengujian | Hasil Pengujian | Status |
|:--:|:--------------|:-------------------|:----------------|:------:|
| 17 | **CRUD Pengguna (Admin)** | Super Admin menambah pengguna baru di `/admin/pengguna` | Dokumen baru tersimpan di koleksi `users` Firestore secara real-time. | [x] Lolos |
| 18 | **CRUD Pengguna (Admin)** | Super Admin mengubah peran/status aktif di `/admin/pengguna` | Profil terbarui di Firestore; peran pengguna langsung berganti secara reaktif. | [x] Lolos |
| 19 | **CRUD Pengguna (Admin)** | Super Admin menghapus akun pengguna lain | Dokumen pengguna terhapus dari Firestore dengan umpan balik Toast notification. | [x] Lolos |
| 20 | **Proteksi Self-Deletion** | Super Admin mencoba menghapus akunnya sendiri yang sedang login | Ditolak oleh sistem dengan pesan proteksi demi menjaga akses administratif. | [x] Lolos |
| 21 | **CRUD Program Bimbel** | Super Admin menambah/mengedit/menghapus program bimbel | Koleksi `program` terbarui; katalog di `/beranda/program` & `/admin` ter-update. | [x] Lolos |
| 22 | **Sistem Presensi Kelas** | Tutor mencatat presensi harian siswa di `/tutor/absen` | Dokumen sesi hadir tersimpan di koleksi `presensi` Firestore. | [x] Lolos |
| 23 | **Rekap Kehadiran Siswa** | Siswa melihat akumulasi kehadiran belajar di `/beranda/absen` | Persentase hadir/izin/alpa dan log pertemuan tampil transparan. | [x] Lolos |
| 24 | **Lonceng Notifikasi** | Peristiwa pendaftaran disetujui, tugas baru, dan nilai keluar | Dokumen terkirim ke `notifikasi`, badge unread muncul di Navbar secara live. | [x] Lolos |
| 25 | **Ekspor Transkrip Nilai** | Siswa/Tutor mengklik tombol Unduh PDF / Excel di `/beranda/nilai` | Dokumen transkrip digital terunduh otomatis dengan data skor & predikat rapi. | [x] Lolos |
| 26 | **Forum Diskusi per Tugas** | Siswa dan Tutor berbalas pesan di `/tugas/[id]` | Pesan tersimpan di koleksi `diskusi_tugas` dan tampil berurutan real-time. | [x] Lolos |
| 27 | **Latihan CBT Interaktif** | Siswa mengerjakan paket soal pilihan ganda di `/beranda/kuis` | Timer berjalan mundur; hasil dan skor akhir tersimpan di `hasil_kuis`. | [x] Lolos |
| 28 | **Audit & Cleanup Data** | Super Admin mengeksekusi pembersihan akun duplikat | Akun uji non-resmi dibersihkan; 4 akun peran resmi PRD dipertahankan utuh. | [x] Lolos |
| 29 | **Pengunjung Anonim** | Membuka rute terproteksi tanpa sesi login | Pengguna otomatis dialihkan ke layar `/masuk`. | [x] Lolos |
| 30 | **Reverse Redirect** | Pengguna yang sudah login mencoba membuka `/masuk` atau `/daftar` | Sistem otomatis mengarahkan kembali ke dasbor peran pengguna. | [x] Lolos |
| 31 | **No-Flicker Page Refresh** | Pengguna me-refresh halaman (F5) pada rute terproteksi | Menampilkan skeleton loader sesaat; halaman tidak berkedip (*no flicker*). | [x] Lolos |
| 32 | **Akun Dinonaktifkan** | Login dengan akun yang memiliki atribut `aktif: false` | Sesi dibatalkan otomatis dan muncul peringatan akun dinonaktifkan. | [x] Lolos |
| 33 | **Kompilasi Produksi** | Menjalankan build produksi `npm run build` | Seluruh 24 rute halaman terkompilasi bersih tanpa error (*Exit Code: 0*). | [x] Lolos |

---

## 4. Kredensial Akun Pengujian Resmi

| Peran | Nama Akun | Email | Kata Sandi | Dasbor Utama |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | Pak Arif Super Admin | `admin@langkahjuara.id` | `Password123!` | `/admin` |
| **Staf Admisi** | Dian Staf Admisi | `staf@langkahjuara.id` | `Password123!` | `/staf` |
| **Tutor** | Hendra Tutor Pendidik | `tutor@langkahjuara.id` | `Password123!` | `/tutor` |
| **Siswa** | Ahmad Alwahyu Pradana | `siswa@langkahjuara.id` | `Password123!` | `/beranda` |

---

## 5. Kesimpulan Evaluasi Pengujian

Seluruh skenario pengujian fungsionalitas, keamanan otorisasi berlapis (RBAC), isolasi data Firestore, fungsionalitas CRUD Super Admin, serta penambahan fitur ekstensi portofolio dinyatakan **Lolos 100%** dan telah memenuhi seluruh kriteria kelulusan dalam Dokumen PRD resmi.
