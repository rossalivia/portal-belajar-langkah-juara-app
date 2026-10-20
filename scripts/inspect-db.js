const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyCd5MivxmWTaI5w8t5wRkMF4lU0WRBVu8Q",
  authDomain: "portal-belajar-d36ff.firebaseapp.com",
  projectId: "portal-belajar-d36ff",
  storageBucket: "portal-belajar-d36ff.firebasestorage.app",
  messagingSenderId: "20416154576",
  appId: "1:20416154576:web:7861609858477cbb1487d5",
  measurementId: "G-BLE48SR7H6",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function inspectData() {
  console.log("Checking Firestore collections...");
  const collections = ["users", "program", "pendaftaran", "kelas", "tugas", "pengumpulan", "penilaian", "presensi"];
  
  for (const colName of collections) {
    try {
      const snap = await getDocs(collection(db, colName));
      console.log(`\n=== Collection: ${colName} (${snap.size} docs) ===`);
      snap.forEach(doc => {
        const data = doc.data();
        if (colName === "users") {
          console.log(`  - [${doc.id}] email: ${data.email}, role: ${data.role}, nama: ${data.nama}`);
        } else if (colName === "kelas") {
          console.log(`  - [${doc.id}] nama: ${data.nama}, tutorId: ${data.tutorId}, siswaIds: ${JSON.stringify(data.siswaIds)}`);
        } else if (colName === "pendaftaran") {
          console.log(`  - [${doc.id}] siswaId: ${data.siswaId}, programId: ${data.programId}, status: ${data.status}`);
        } else {
          console.log(`  - [${doc.id}] keys: ${Object.keys(data).join(", ")}`);
        }
      });
    } catch (e) {
      console.error(`Error reading ${colName}:`, e.message);
    }
  }
}

inspectData().then(() => process.exit(0)).catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
