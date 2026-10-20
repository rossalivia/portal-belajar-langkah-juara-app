// Data Awal (Seed Data) untuk 7 Koleksi Firestore sesuai Bab 7 PRD Portal Belajar Langkah Juara

export const initialUsers = [
  {
    id: "user-siswa-1",
    nama: "Ahmad Rizky Pratama",
    email: "ahmad.rizky@siswa.langkahjuara.id",
    role: "siswa",
    avatar: "AR",
    telepon: "081234567801",
    sekolah: "SMA Negeri 1 Jakarta",
  },
  {
    id: "user-siswa-2",
    nama: "Siti Rahma Azzahra",
    email: "siti.rahma@siswa.langkahjuara.id",
    role: "siswa",
    avatar: "SR",
    telepon: "081234567802",
    sekolah: "SMA Negeri 8 Jakarta",
  },
  {
    id: "user-siswa-3",
    nama: "Budi Santoso",
    email: "budi.santoso@siswa.langkahjuara.id",
    role: "siswa",
    avatar: "BS",
    telepon: "081234567803",
    sekolah: "SMA Negeri 3 Bandung",
  },
  {
    id: "user-staf-1",
    nama: "Dian Permatasari, S.Pd",
    email: "dian.admin@staf.langkahjuara.id",
    role: "staf",
    avatar: "DP",
    telepon: "081234567810",
    divisi: "Admisi & Akademik",
  },
  {
    id: "user-tutor-1",
    nama: "Dr. Hendra Wijaya, M.Sc",
    email: "hendra.wijaya@tutor.langkahjuara.id",
    role: "tutor",
    avatar: "HW",
    telepon: "081234567820",
    bidang: "Penalaran Matematika & TPS",
  },
  {
    id: "user-tutor-2",
    nama: "Nurul Hidayati, M.Pd",
    email: "nurul.hidayati@tutor.langkahjuara.id",
    role: "tutor",
    avatar: "NH",
    telepon: "081234567821",
    bidang: "Literasi Bahasa Indonesia & Inggris",
  },
  {
    id: "user-admin-1",
    nama: "Bambang Sudiro, S.Kom",
    email: "superadmin@langkahjuara.id",
    role: "super_admin",
    avatar: "BS",
    telepon: "081234567899",
    divisi: "Direktorat Operasional",
  },
];

export const initialProgram = [
  {
    id: "prog-1",
    nama: "Program Intensif SNBT Juara 2026",
    deskripsi: "Pendalaman materi TPS, Literasi Bahasa, dan Penalaran Matematika dilengkapi 20x Try Out adaptif berbasis IRT dan drill soal prediktif.",
    durasi: "6 Bulan",
    target: "Siswa Kelas 12 & Gap Year",
    biaya: "Rp 3.500.000",
    kuota: 60,
    fasilitas: ["Tryout Mingguan IRT", "Modul Eksklusif Cetak & Digital", "Konsultasi Jurusan 1-on-1", "Akses Rekaman Kelas"],
  },
  {
    id: "prog-2",
    nama: "Program Kedinasan Unggul (STAN, IPDN, STIS)",
    deskripsi: "Bimbingan spesifik SKD (TWK, TIU, TKP) dengan metode cepat serta tes psikotes dan persiapan tes fisik.",
    durasi: "4 Bulan",
    target: "Calon Praja & Taruna",
    biaya: "Rp 4.200.000",
    kuota: 40,
    fasilitas: ["Simulasi CAT BKN Realistis", "Bedah Trik Cepat TIU", "Bimbingan Wawancara", "Mentor Alumni Kedinasan"],
  },
  {
    id: "prog-3",
    nama: "Program Reguler Sukses SMA Juara",
    deskripsi: "Penguatan fondasi akademik semester, persiapan asesmen sekolah, dan pendampingan PR harian untuk kelas 10-11.",
    durasi: "1 Tahun",
    target: "Siswa Kelas 10 & 11 SMA",
    biaya: "Rp 2.800.000",
    kuota: 80,
    fasilitas: ["Klinik PR Harian", "Kelas Kecil Maks. 15 Siswa", "Laporan Perkembangan Bulanan", "Grup Diskusi Tutor 24/7"],
  },
];

export const initialPendaftaran = [
  {
    id: "reg-101",
    siswaId: "user-siswa-1",
    programId: "prog-1",
    status: "disetujui",
    tanggalDaftar: "2026-09-15T08:30:00Z",
    catatan: "Dokumen raport dan verifikasi identitas lengkap.",
  },
  {
    id: "reg-102",
    siswaId: "user-siswa-2",
    programId: "prog-1",
    status: "disetujui",
    tanggalDaftar: "2026-09-18T10:15:00Z",
    catatan: "Pendaftaran diverifikasi oleh staf Dian.",
  },
  {
    id: "reg-103",
    siswaId: "user-siswa-3",
    programId: "prog-2",
    status: "menunggu",
    tanggalDaftar: "2026-10-08T14:20:00Z",
    catatan: "Menunggu verifikasi bukti pembayaran dan berkas ijazah.",
  },
];

export const initialKelas = [
  {
    id: "kelas-1",
    nama: "Kelas SNBT Alpha - Penalaran Matematika",
    programId: "prog-1",
    tutorId: "user-tutor-1",
    siswaIds: ["user-siswa-1", "user-siswa-2"],
    jadwal: "Senin & Kamis, 16.00 - 18.00 WIB",
    ruang: "Lab Saintek Virtual 01",
  },
  {
    id: "kelas-2",
    nama: "Kelas SNBT Beta - Literasi Indonesia & Inggris",
    programId: "prog-1",
    tutorId: "user-tutor-2",
    siswaIds: ["user-siswa-1"],
    jadwal: "Selasa & Jumat, 16.00 - 18.00 WIB",
    ruang: "Studio Bahasa 02",
  },
  {
    id: "kelas-3",
    nama: "Kelas Kedinasan Garuda - SKD & TIU Trik Cepat",
    programId: "prog-2",
    tutorId: "user-tutor-1",
    siswaIds: [],
    jadwal: "Rabu & Sabtu, 14.00 - 16.00 WIB",
    ruang: "Aula Praja 03",
  },
];

export const initialTugas = [
  {
    id: "tugas-1",
    kelasId: "kelas-1",
    judul: "Tryout Mandiri Penalaran Kuantitatif Bagian 1",
    deskripsi: "Selesaikan 20 butir soal penalaran kuantitatif tipe UTBK terbaru. Tuliskan langkah pengerjaan analitis dan upload dalam format PDF atau tautan dokumen Google Drive.",
    tenggatWaktu: "2026-10-20T23:59:00Z",
    bobotNilai: 100,
  },
  {
    id: "tugas-2",
    kelasId: "kelas-1",
    judul: "Latihan Pola Deret Angka & Aljabar Cepat",
    deskripsi: "Kerjakan lembar kerja 15 soal deret bertingkat dan matriks logika. Waktu pengerjaan maksimal 30 menit untuk melatih manajemen waktu.",
    tenggatWaktu: "2026-10-25T23:59:00Z",
    bobotNilai: 100,
  },
  {
    id: "tugas-3",
    kelasId: "kelas-2",
    judul: "Analisis Kritis Teks Literasi Bahasa Indonesia",
    deskripsi: "Temukan ide pokok, simpulan tersirat, dan kelemahan argumen dari artikel ilmiah terlampir minimal 300 kata.",
    tenggatWaktu: "2026-10-22T23:59:00Z",
    bobotNilai: 100,
  },
];

export const initialPengumpulan = [
  {
    id: "submit-1",
    tugasId: "tugas-1",
    siswaId: "user-siswa-1",
    jawaban: "https://drive.google.com/file/d/ahmad_rizky_tryout1_pkuantitatif.pdf (Solusi lengkap 20 soal dengan metode eliminasi cerdas)",
    tanggalKumpul: "2026-10-18T19:45:00Z",
  },
  {
    id: "submit-2",
    tugasId: "tugas-1",
    siswaId: "user-siswa-2",
    jawaban: "Jawaban terlampir: Berhasil menyelesaikan soal 1-18 dengan metode grafik koordinat. Soal nomor 19 dan 20 menggunakan penalaran probabilitas bersyarat.",
    tanggalKumpul: "2026-10-19T21:10:00Z",
  },
];

export const initialPenilaian = [
  {
    id: "grade-1",
    pengumpulanId: "submit-1",
    nilai: 92,
    catatanTutor: "Analisis penalaran matematis sangat rapi dan logis. Catatan perbaikan: perhatikan kecepatan di soal nomor 14 mengenai geometri analitik.",
  },
];
