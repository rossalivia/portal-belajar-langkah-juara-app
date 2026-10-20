# PRODUCT REQUIREMENTS DOCUMENT (PRD)

**Portal Belajar Langkah Juara**

## 1\. Ringkasan Eksekutif

Portal Belajar Langkah Juara adalah *Learning Management System* (LMS) berbasis web untuk mengelola administrasi dan kegiatan belajar di bimbingan belajar. Aplikasi ini dirancang untuk menyatukan pendaftaran, penempatan kelas, penugasan, dan penilaian ke dalam satu platform terpadu.

Sebagai produk unggulan, portal ini tidak hanya memenuhi kebutuhan fungsional operasional bimbel, tetapi juga mengedepankan praktik terbaik dalam **desain UI/UX** untuk pengalaman pengguna yang intuitif, serta fitur **analisis data** pada dasbor untuk memberikan wawasan visual terkait performa siswa dan tren operasional kepada staf dan tutor.

## 2\. Pengguna & Peran

Aplikasi menggunakan empat peran utama yang diatur dalam dokumen `users/{uid}`.

1. **Siswa (`siswa`)**: Peran *default* untuk pendaftar baru. Mengajukan pendaftaran, melihat materi/tugas, mengumpulkan tugas, dan melihat nilai.  
2. **Staf (`staf`)**: Mengelola persetujuan pendaftaran siswa dan menempatkan siswa ke kelas yang tepat.  
3. **Tutor (`tutor`)**: Mengelola kelas yang menjadi tanggung jawabnya, memberikan tugas, dan melakukan penilaian serta memberikan umpan balik edukatif.  
4. **Super Admin (`super_admin`)**: Memiliki akses ke semua halaman dasbor, melihat analitik keseluruhan, dan mengelola hak akses (mengubah peran pengguna).

## 3\. Lingkup Produk

### Fitur Inti (Kepatuhan Alur Sesi 6\)

* Autentikasi ganda (Email/Password & Google).  
* *Route guard* berlapis berdasarkan dokumen profil.  
* Alur bisnis end-to-end: Daftar \-\> Disetujui \-\> Masuk Kelas \-\> Tugas \-\> Kumpul \-\> Nilai.

### Ekstensi Portofolio (UI/UX & Analisis Data)

* **Dasbor Analitik**: Visualisasi data performa siswa (grafik nilai rata-rata, tingkat penyelesaian tugas) pada dasbor Tutor dan Super Admin.  
* **Micro-interactions & State Management**: Penggunaan *skeleton loading* yang mulus, status *empty states* yang interaktif, dan notifikasi *toast* untuk setiap operasi berhasil/gagal.  
* **Umpan Balik Tugas**: Sistem komentar pada penilaian tugas agar komunikasi tutor dan siswa lebih interaktif.

## 4\. Kebutuhan Fungsional (Modul & Route)

Alamat halaman wajib dijaga agar *route guard* berfungsi sesuai standar keamanan.

### 4.1 Akses Publik (Pengunjung)

* `/masuk` : Pintu masuk aplikasi.  
* `/daftar` : Pembuatan akun baru.

### 4.2 Modul Siswa

* `/beranda` : Dasbor utama siswa, menampilkan metrik ringkasan kemajuan belajar.  
* `/beranda/program` : Formulir pengajuan keikutsertaan program bimbel.  
* `/beranda/tugas` : Daftar tugas (dilengkapi filter status: Selesai/Belum) dan form pengumpulan.  
* `/beranda/nilai` : Rangkuman nilai tugas beserta catatan/umpan balik dari tutor.

### 4.3 Modul Staf

* `/staf` : Dasbor staf dengan analitik pendaftaran aktif.  
* `/staf/pendaftaran` : Tabel interaktif untuk menyetujui (`disetujui`) atau menolak (`ditolak`) pendaftaran.  
* `/staf/kelas` : Modul penempatan siswa yang telah disetujui ke dalam kelas.

### 4.4 Modul Tutor

* `/tutor` : Dasbor tutor yang menampilkan grafik tingkat partisipasi pengumpulan tugas.  
* `/tutor/tugas` : Pembuatan tugas dengan *rich-text* dan tenggat waktu.  
* `/tutor/penilaian` : Antarmuka *grading* untuk memberikan nilai angka dan evaluasi tertulis pada pengumpulan siswa.

### 4.5 Modul Super Admin

* `/admin` : Dasbor sentral dengan grafik agregat pertumbuhan pengguna dan metrik pendaftaran.  
* `/admin/pengguna` : Manajemen profil pengguna untuk mengubah *role*.

## 5\. Identitas Visual & Prinsip Antarmuka (UI/UX)

Desain antarmuka difokuskan pada fungsionalitas, aksesibilitas, dan alur kerja yang logis.

* **Tipografi & Hirarki**: Menggunakan sans-serif modern (misal: Inter) dengan hirarki teks yang jelas agar metrik data pada dasbor mudah dipindai.  
* **Feedback Visual**: Setiap aksi (simpan tugas, ubah role, kumpul tugas) wajib memberikan respons instan, mencegah form terkirim ganda, dan memanfaatkan transisi halaman yang tidak berkedip.  
* **Aksesibilitas**: Kontras warna dievaluasi untuk keterbacaan tinggi. Formulir dirancang ramah bagi pembaca layar (*screen reader*) dengan label yang presisi.  
* **Empty States**: Halaman kosong (misal: belum ada tugas) tidak dibiarkan kosong, melainkan menampilkan grafis ilustratif dengan tombol *Call-to-Action* (CTA).

## 6\. Penjagaan Halaman dan Data

* **Route Guard Frontend**: Menampilkan *loading state* (bukan halaman berkedip) saat membaca peran dari Firebase. Pengguna yang mengakses *route* di luar kewenangannya diarahkan ke halaman "Akses Ditolak".  
* **Kerahasiaan Data**: Siswa mutlak hanya dapat melihat presensi dan tugas miliknya sendiri. Tidak diperbolehkan adanya celah akses antar-siswa.

## 7\. Struktur Data Firestore (7 Koleksi Utama)

Sistem menggunakan 7 koleksi yang relasinya saling mengikat untuk memastikan integritas data.

1. **`users`**  
   - `id`: string (merujuk `uid` Firebase Auth)  
   - `nama`: string  
   - `email`: string  
   - `role`: string (`siswa`, `staf`, `tutor`, `super_admin`)  
2. **`program`**  
   - `nama`: string  
   - `deskripsi`: string  
3. **`pendaftaran`**  
   - `siswaId`: string  
   - `programId`: string  
   - `status`: string (`menunggu`, `disetujui`, `ditolak`)  
   - `tanggalDaftar`: timestamp  
4. **`kelas`**  
   - `nama`: string  
   - `tutorId`: string  
   - `siswaIds`: array of string  
5. **`tugas`**  
   - `kelasId`: string  
   - `judul`: string  
   - `deskripsi`: string  
   - `tenggatWaktu`: timestamp  
6. **`pengumpulan`**  
   - `tugasId`: string  
   - `siswaId`: string  
   - `jawaban`: string (teks/link dokumen)  
   - `tanggalKumpul`: timestamp  
7. **`penilaian`**  
   - `pengumpulanId`: string  
   - `nilai`: number  
   - `catatanTutor`: string

## 8\. Pengujian

Pengujian mencakup 16 skenario matriks akses (uji tembus URL) dan pengujian alur bisnis *end-to-end*. Tabel uji akan memastikan logika *redirect* berjalan sempurna, tidak ada *role* yang tertimpa saat *login* ulang, dan dasbor analitik menampilkan kalkulasi data yang akurat dari Firestore.