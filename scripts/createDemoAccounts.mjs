import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCd5MivxmWTaI5w8t5wRkMF4lU0WRBVu8Q",
  authDomain: "portal-belajar-d36ff.firebaseapp.com",
  projectId: "portal-belajar-d36ff",
  storageBucket: "portal-belajar-d36ff.firebasestorage.app",
  messagingSenderId: "20416154576",
  appId: "1:20416154576:web:7861609858477cbb1487d5",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const demoUsers = [
  {
    email: "superadmin@langkahjuara.id",
    password: "Password123!",
    nama: "Bambang Sudiro, S.Kom",
    role: "super_admin",
    telepon: "081234567899",
    divisi: "Direktorat Operasional",
  },
  {
    email: "dian.admin@staf.langkahjuara.id",
    password: "Password123!",
    nama: "Dian Permatasari, S.Pd",
    role: "staf",
    telepon: "081234567810",
    divisi: "Admisi & Akademik",
  },
  {
    email: "hendra.wijaya@tutor.langkahjuara.id",
    password: "Password123!",
    nama: "Dr. Hendra Wijaya, M.Sc",
    role: "tutor",
    telepon: "081234567820",
    bidang: "Penalaran Matematika & TPS",
  },
  {
    email: "ahmad.rizky@siswa.langkahjuara.id",
    password: "Password123!",
    nama: "Ahmad Rizky Pratama",
    role: "siswa",
    telepon: "081234567801",
    sekolah: "SMA Negeri 1 Jakarta",
  },
];

async function main() {
  console.log("Memulai pembuatan akun demo di Firebase Authentication & Firestore...");

  for (const u of demoUsers) {
    try {
      let userRecord = null;
      try {
        const cred = await createUserWithEmailAndPassword(auth, u.email, u.password);
        userRecord = cred.user;
        console.log(`[BERHASIL DIBUAT] ${u.email} (UID: ${userRecord.uid})`);
      } catch (err) {
        if (err.code === "auth/email-already-in-use") {
          console.log(`[SUDAH ADA] ${u.email}, mencoba login untuk update profil...`);
          const cred = await signInWithEmailAndPassword(auth, u.email, u.password);
          userRecord = cred.user;
        } else {
          console.error(`[ERROR BUAT AKUN] ${u.email}:`, err.message);
        }
      }

      if (userRecord) {
        await setDoc(doc(db, "users", userRecord.uid), {
          id: userRecord.uid,
          nama: u.nama,
          email: u.email,
          role: u.role,
          aktif: true,
          telepon: u.telepon || "",
          sekolah: u.sekolah || "",
          divisi: u.divisi || "",
          bidang: u.bidang || "",
          createdAt: new Date().toISOString(),
        }, { merge: true });
        console.log(`[PROFIL DISIMPAN] Firestore users/${userRecord.uid} sebagai role: ${u.role}`);
      }
    } catch (e) {
      console.error(`[FATAL] Gagal memproses ${u.email}:`, e);
    }
  }

  console.log("Selesai!");
  process.exit(0);
}

main();
