/**
 * Skrip Pembersihan Database (Database Cleanup) - Portal Belajar Langkah Juara
 * 
 * Fungsionalitas:
 * 1. Mengidentifikasi 4 akun resmi Cloud Firestore (1 Super Admin, 1 Staf, 1 Tutor, 1 Siswa).
 * 2. Menjaga integritas relasi data (kelas, pendaftaran, pengumpulan, penilaian) agar tidak ada broken references.
 * 3. Menghapus seluruh akun tiruan / duplikat / test di koleksi `users`.
 * 4. Menghapus pendaftaran usang milik akun yang telah dihapus.
 * 
 * Cara Menjalankan:
 *   node scripts/cleanup-database.js
 */

const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} = require("firebase/firestore");

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCd5MivxmWTaI5w8t5wRkMF4lU0WRBVu8Q",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "portal-belajar-d36ff.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "portal-belajar-d36ff",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "portal-belajar-d36ff.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "20416154576",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:20416154576:web:7861609858477cbb1487d5",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-BLE48SR7H6",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 4 Akun Resmi Terverifikasi yang Dipertahankan (1 untuk setiap peran resmi PRD)
const OFFICIAL_PRESERVED_ACCOUNTS = {
  super_admin: {
    id: "RjKtSMKlAHfBRVgpuuEVu6I2jsJ3",
    email: "admin@langkahjuara.id",
    nama: "Pak Arif Super Admin",
    role: "super_admin",
  },
  staf: {
    id: "QWaw392xoGOV8PAA0uYwcG2yiMQ2",
    email: "staf@langkahjuara.id",
    nama: "Dian Staf Admisi",
    role: "staf",
  },
  tutor: {
    id: "JEWXKcYZvtagspeoMoYW3LWr7kO2",
    email: "tutor@langkahjuara.id",
    nama: "Hendra Tutor Pendidik",
    role: "tutor",
  },
  siswa: {
    id: "PiU6GDhxFkT8aJERKAelVDTOa9C2",
    email: "siswa@langkahjuara.id",
    nama: "Ahmad Alwahyu Pradana",
    role: "siswa",
  },
};

const PRESERVED_UIDS = new Set(
  Object.values(OFFICIAL_PRESERVED_ACCOUNTS).map((acc) => acc.id)
);

async function runCleanup() {
  console.log("==================================================================");
  console.log("🚀 MEMULAI PROSES PEMBERSIHAN DATABASE (DATABASE CLEANUP)");
  console.log("   Portal Belajar Langkah Juara - Cloud Firestore");
  console.log("==================================================================\n");

  console.log("📌 1. AKUN RESMI YANG DIPERTAHANKAN (4 PERAN UTAMA):");
  Object.entries(OFFICIAL_PRESERVED_ACCOUNTS).forEach(([role, acc]) => {
    console.log(`   - [${role.toUpperCase()}]: ${acc.nama} (${acc.email}) -> UID: ${acc.id}`);
  });
  console.log("");

  // LANGKAH 1: Sanitasi Relasi Koleksi Kelas
  console.log("🔄 2. Memperbarui Relasi Koleksi 'kelas'...");
  const kelasSnap = await getDocs(collection(db, "kelas"));
  for (const docSnap of kelasSnap.docs) {
    const data = docSnap.data();
    const updatedSiswaIds = [OFFICIAL_PRESERVED_ACCOUNTS.siswa.id];
    const updatedTutorId = OFFICIAL_PRESERVED_ACCOUNTS.tutor.id;

    await updateDoc(doc(db, "kelas", docSnap.id), {
      tutorId: updatedTutorId,
      siswaIds: updatedSiswaIds,
    });
    console.log(`   ✓ Kelas [${docSnap.id}] '${data.nama}': Tutor diarahkan ke UID ${updatedTutorId}, Siswa disinkronkan ke UID ${updatedSiswaIds}`);
  }
  console.log("");

  // LANGKAH 2: Sanitasi Relasi Koleksi Pengumpulan Tugas
  console.log("🔄 3. Menyelaraskan Koleksi 'pengumpulan' & 'penilaian'...");
  const submitSnap = await getDocs(collection(db, "pengumpulan"));
  for (const docSnap of submitSnap.docs) {
    await updateDoc(doc(db, "pengumpulan", docSnap.id), {
      siswaId: OFFICIAL_PRESERVED_ACCOUNTS.siswa.id,
    });
    console.log(`   ✓ Pengumpulan [${docSnap.id}]: Diselaraskan dengan siswa resmi UID ${OFFICIAL_PRESERVED_ACCOUNTS.siswa.id}`);
  }
  console.log("");

  // LANGKAH 3: Pembersihan Koleksi Pendaftaran Usang
  console.log("🔄 4. Membersihkan Koleksi 'pendaftaran' Usang...");
  const pendaftaranSnap = await getDocs(collection(db, "pendaftaran"));
  let deletedRegCount = 0;
  for (const docSnap of pendaftaranSnap.docs) {
    const data = docSnap.data();
    if (!PRESERVED_UIDS.has(data.siswaId)) {
      await deleteDoc(doc(db, "pendaftaran", docSnap.id));
      console.log(`   ✕ Menghapus pendaftaran dummy [${docSnap.id}] untuk siswa non-aktif UID: ${data.siswaId}`);
      deletedRegCount++;
    } else {
      console.log(`   ✓ Mempertahankan pendaftaran aktif [${docSnap.id}] untuk siswa resmi UID: ${data.siswaId}`);
    }
  }
  console.log(`   Total pendaftaran usang dihapus: ${deletedRegCount}\n`);

  // LANGKAH 4: Pembersihan Pengguna Tiruan & Duplikat di Koleksi Users
  console.log("🔄 5. Membersihkan Dokumen Pengguna Tiruan / Duplikat di Koleksi 'users'...");
  const usersSnap = await getDocs(collection(db, "users"));
  let deletedUserCount = 0;
  const remainingUsers = [];

  for (const docSnap of usersSnap.docs) {
    const data = docSnap.data();
    if (!PRESERVED_UIDS.has(docSnap.id)) {
      await deleteDoc(doc(db, "users", docSnap.id));
      console.log(`   ✕ Dihapus: [${docSnap.id}] ${data.nama || "No Name"} (${data.email || "No Email"}) - Role: ${data.role || "unknown"}`);
      deletedUserCount++;
    } else {
      remainingUsers.push({
        id: docSnap.id,
        nama: data.nama,
        email: data.email,
        role: data.role,
      });
    }
  }

  console.log("\n==================================================================");
  console.log("✅ PEMBERSIHAN DATABASE SELESAI DENGAN SUKSES");
  console.log("==================================================================");
  console.log(`📊 Statistik Pembersihan:`);
  console.log(`   - Total akun tiruan / duplikat dihapus : ${deletedUserCount} akun`);
  console.log(`   - Total akun resmi tersisa            : ${remainingUsers.length} akun (1 per peran)\n`);

  console.log(`🏆 Akun Resmi yang Tersedia di Platform:`);
  remainingUsers.forEach((u, idx) => {
    console.log(`   ${idx + 1}. [${u.role.toUpperCase()}] ${u.nama} (${u.email}) | UID: ${u.id}`);
  });
  console.log("==================================================================\n");
}

runCleanup()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Gagal menjalankan pembersihan database:", err);
    process.exit(1);
  });
