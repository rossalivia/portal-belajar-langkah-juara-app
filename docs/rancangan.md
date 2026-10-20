# DOKUMEN RANCANGAN HAK AKSES, ARSITEKTUR & SISTEM KEAMANAN
**Portal Belajar Langkah Juara**

Dokumen ini merupakan panduan resmi rancangan arsitektur sistem, sistem keamanan, matriks hak akses pengguna (RBAC), skema database Cloud Firestore, pemetaan *Route Guard*, dan standar antarmuka pengguna yang **100% patuh dan selaras dengan Product Requirements Document (PRD) Bab 1 s.d. Bab 8**.

---

## 1. Matriks Akses Pengguna (PRD Bab 2, Bab 4 & Bab 6)

Tabel berikut menyajikan matriks hak akses resmi seluruh modul dan fitur aplikasi untuk 5 kategori peran:
* **Pengunjung**: Pengguna anonim yang belum terautentikasi di sistem.
* **Siswa (`siswa`)**: Peserta didik bimbingan belajar.
* **Staf Admisi (`staf`)**: Petugas administrasi dan admisi operasional.
* **Tutor (`tutor`)**: Tenaga pendidik / pengajar bimbingan belajar.
* **Super Admin (`super_admin` / `admin`)**: Pimpinan lembaga / pemilik (*owner*) dengan wewenang tertinggi.

| No | Modul & Fitur Resmi | URL Rute Resmi | Pengunjung | Siswa | Staf Admisi | Tutor | Super Admin |
|:--:|:--------------------|:---------------|:----------:|:-----:|:-----------:|:-----:|:-----------:|
| **1** | Pintu Masuk / Autentikasi Pengguna | `/masuk` | ✓ | ✓ *(redirect)* | ✓ *(redirect)* | ✓ *(redirect)* | ✓ *(redirect)* |
| **2** | Registrasi Akun Siswa Baru | `/daftar` | ✓ | ✓ *(redirect)* | ✓ *(redirect)* | ✓ *(redirect)* | ✓ *(redirect)* |
| **3** | Dasbor Ringkasan Belajar Siswa | `/beranda` | ✕ | ✓ (milik sendiri) | ✕ | ✕ | ✓ |
| **4** | Pengajuan & Katalog Program Bimbel | `/beranda/program` | ✕ | ✓ (ajukan) | ✕ | ✕ | ✓ (CRUD master) |
| **5** | Daftar Tugas & Pengumpulan Jawaban | `/beranda/tugas` | ✕ | ✓ (kelas diikuti) | ✕ | ✕ | ✓ |
| **6** | Rekap Nilai & Ekspor Transkrip (PDF/Excel) | `/beranda/nilai` | ✕ | ✓ (milik sendiri) | ✕ | ✕ | ✓ |
| **7** | Rekap Presensi & Kehadiran Siswa | `/beranda/absen` | ✕ | ✓ (milik sendiri) | ✕ | ✕ | ✓ |
| **8** | Kalender & Jadwal Pelajaran Rombel | `/beranda/jadwal` | ✕ | ✓ (kelas diikuti) | ✕ | ✕ | ✓ |
| **9** | Latihan Soal CBT & Kuis Interaktif | `/beranda/kuis` | ✕ | ✓ (mandiri) | ✕ | ✕ | ✓ |
| **10** | Detail Tugas & Forum Diskusi Interaktif | `/tugas/[id]` | ✕ | ✓ (rombel sama) | ✕ | ✓ (pengampu) | ✓ |
| **11** | Pengaturan Profil Pengguna & Keamanan | `/profil` | ✕ | ✓ (milik sendiri) | ✓ (milik sendiri) | ✓ (milik sendiri) | ✓ |
| **12** | Dasbor Operasional Staf Admisi | `/staf` | ✕ | ✕ | ✓ | ✕ | ✓ |
| **13** | Verifikasi & Persetujuan Pendaftaran | `/staf/pendaftaran` | ✕ | ✕ | ✓ | ✕ | ✓ |
| **14** | Penempatan Siswa ke Rombongan Belajar | `/staf/kelas` | ✕ | ✕ | ✓ | ✕ | ✓ |
| **15** | Dasbor Metrik & Partisipasi Tutor | `/tutor` | ✕ | ✕ | ✕ | ✓ (kelas diampu) | ✓ |
| **16** | Penerbitan Tugas & Penentuan Deadline | `/tutor/tugas` | ✕ | ✕ | ✕ | ✓ (kelas diampu) | ✓ |
| **17** | Antarmuka Grading (Skor & Evaluasi) | `/tutor/penilaian` | ✕ | ✕ | ✕ | ✓ (kelas diampu) | ✓ |
| **18** | Sesi Pencatatan Presensi Harian Rombel | `/tutor/absen` | ✕ | ✕ | ✕ | ✓ (kelas diampu) | ✓ |
| **19** | Dasbor Sentral Analitik Platform | `/admin` | ✕ | ✕ | ✕ | ✕ | ✓ |
| **20** | Manajemen Pengguna & Hak Akses (CRUD) | `/admin/pengguna` | ✕ | ✕ | ✕ | ✕ | ✓ |

*Keterangan Simbol Akses:*
* **✓** : Diizinkan membuka dan mengelola halaman secara penuh.
* **✓ (milik sendiri)** : Hak akses dibatasi hanya untuk data yang berelasi dengan ID pengguna yang sedang login (*data isolation*).
* **✓ (kelas diampu)** : Hak akses dibatasi hanya untuk rombongan belajar di mana `tutorId` sesuai dengan ID tutor login.
* **✓ *(redirect)*** : Pengguna yang sudah login otomatis dialihkan (*reverse redirect*) ke dasbor peran masing-masing.
* **✕** : Diblokir oleh *Route Guard* frontend (layar 403) dan Firestore Security Rules (*Permission Denied*).

---

## 2. Arsitektur Route Guard Frontend ([`RouteGuard.jsx`](file:///c:/Users/ASUS/Documents/Bootcamp%20Web%20Pro%20PLAN/bootcamp/portal-belajar-langkah-juara-app/portal-belajar-langkah-juara-app/src/components/RouteGuard.jsx))

Sistem pengamanan navigasi menerapkan prinsip **No-Flicker Multi-stage Route Guard**:
1. **Verifikasi Keberadaan Sesi**:
   - Membaca status `isLoadingAuth` dari Firebase Authentication.
   - Membaca status `isRoleLoading` dan dokumen `users/{uid}` dari Cloud Firestore.
2. **Loading State Bebas Kedipan**:
   - Selama pembacaan peran berlangsung, sistem merender indikator *Loading Spinner* elegan dan menahan keputusan redirect sehingga rute tidak berkedip (*no flicker*) saat pengguna me-refresh peramban (F5).
3. **Penyaringan Wewenang**:
   - Jika pengguna anonim membuka rute terproteksi, diarahkan langsung ke `/masuk`.
   - Jika pengguna terotentikasi membuka rute di luar perannya, sistem menampilkan antarmuka [`AccessDenied.jsx`](file:///c:/Users/ASUS/Documents/Bootcamp%20Web%20Pro%20PLAN/bootcamp/portal-belajar-langkah-juara-app/portal-belajar-langkah-juara-app/src/components/AccessDenied.jsx) (HTTP 403) dengan keterangan peran aktif dan rute yang diizinkan.
   - Peran `super_admin` atau `admin` otomatis diberikan *bypass* akses penuh ke seluruh rute.
4. **Proteksi Akun Nonaktif**:
   - Jika dokumen pengguna memiliki atribut `aktif: false`, sistem langsung membatalkan sesi (`signOut`) dan menampilkan pesan instruksi untuk menghubungi staf admisi.

---

## 3. Skema Koleksi Cloud Firestore (12 Koleksi Utama)

Sistem mengintegrasikan 7 koleksi inti PRD beserta 5 koleksi ekstensi portofolio tingkat lanjut:

1. **`users` (`users/{uid}`)**:
   - `id`: string (UID Firebase Auth)
   - `nama`: string, `email`: string, `role`: string (`siswa` | `staf` | `tutor` | `super_admin`)
   - `aktif`: boolean, `telepon`: string, `sekolah`: string, `divisi`: string, `bidang`: string
2. **`program`**:
   - `id`: string, `nama`: string, `deskripsi`: string, `biaya`: string, `durasi`: string, `target`: string, `kuota`: number, `fasilitas`: array of string
3. **`pendaftaran`**:
   - `id`: string, `siswaId`: string, `programId`: string, `status`: string (`menunggu` | `disetujui` | `ditolak`), `catatan`: string, `catatanStaf`: string, `tanggalDaftar`: timestamp
4. **`kelas`**:
   - `id`: string, `nama`: string, `tutorId`: string, `siswaIds`: array of string, `jadwal`: string, `ruang`: string
5. **`tugas`**:
   - `id`: string, `kelasId`: string, `judul`: string, `deskripsi`: string, `bobotNilai`: number, `tenggatWaktu`: timestamp, `createdAt`: timestamp
6. **`pengumpulan`**:
   - `id`: string, `tugasId`: string, `siswaId`: string, `jawaban`: string, `tanggalKumpul`: timestamp
7. **`penilaian`**:
   - `id`: string, `pengumpulanId`: string, `nilai`: number (0-100), `catatanTutor`: string, `tanggalNilai`: timestamp
8. **`presensi`**:
   - `id`: string, `kelasId`: string, `tutorId`: string, `tanggal`: string (YYYY-MM-DD), `daftarHadir`: array of `{ siswaId: string, status: "hadir" | "izin" | "alpa" }`, `createdAt`: timestamp
9. **`notifikasi`**:
   - `id`: string, `userId`: string, `pesan`: string, `dibaca`: boolean, `tautan`: string, `createdAt`: timestamp
10. **`diskusi_tugas`**:
    - `id`: string, `tugasId`: string, `pengirimId`: string, `namaPengirim`: string, `rolePengirim`: string, `pesan`: string, `createdAt`: timestamp
11. **`kuis`**:
    - `id`: string, `judul`: string, `kategori`: string, `durasiMenit`: number, `soalList`: array of questions
12. **`hasil_kuis`**:
    - `id`: string, `kuisId`: string, `siswaId`: string, `skor`: number, `totalBenar`: number, `totalSoal`: number, `submittedAt`: timestamp

---

## 4. Sistem Desain & Estetika Antarmuka (iOS Clean Minimalist)

Sesuai arahan perombakan visual modern:
- **Latar Belakang Global**: `bg-[#F2F2F7]` (sistem abu-abu netral Apple iOS).
- **Kartu & Kontainer**: Sudut membulat modern (`rounded-2xl` & `rounded-3xl`), border tipis (`border-slate-200/60`), bayangan lembut (`shadow-xs`).
- **Palet Warna**: Monokrom netral dengan aksen biru iOS (`text-blue-600`, `bg-blue-600`), emerald untuk status sukses, amber untuk peringatan, dan rose untuk tindakan destruktif.
- **Tipografi**: Sans-serif bersih (Inter & Plus Jakarta Sans) dengan kontras teks tajam (`text-slate-900` dan `text-slate-500`).
- **Mikro-interaksi**: Efek `active:scale-95 duration-150` pada tombol, transisi fade-in pada modal, dan skeleton pulse loading yang halus.

---

## 5. Keputusan Wewenang Operasional Wajib (PRD Compliance)

1. **Bolehkah Staf mengubah nilai tugas?**
   > **TIDAK BOLEH.** Wewenang penilaian tugas eksklusif milik Tutor pengampu rombel (`/tutor/penilaian`) dan Super Admin. Staf dibatasi pada admisi dan penempatan kelas.
2. **Bolehkah Tutor A membuka kelas Tutor B?**
   > **TIDAK BOLEH.** Berlaku prinsip *Class Isolation*; query menyaring `tutorId === currentUser.id`.
3. **Bolehkah Siswa A melihat nilai Siswa B?**
   > **TIDAK BOLEH.** Berlaku prinsip *Student Data Isolation*; siswa hanya dapat melihat tugas dan nilai di mana `siswaId === currentUser.id`.
4. **Halaman mana saja yang boleh dibuka Super Admin?**
   > **SEMUA HALAMAN APLIKASI.** Super Admin memiliki wewenang global untuk mengelola seluruh data platform, membuka seluruh halaman siswa/staf/tutor, serta mengakses menu kendali utama `/admin` dan `/admin/pengguna`.
