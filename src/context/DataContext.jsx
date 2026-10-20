"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  // State Autentikasi & Pembacaan Dokumen users/{uid}
  const [authUser, setAuthUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isRoleLoading, setIsRoleLoading] = useState(true);

  // State 7 Koleksi Cloud Firestore (default ke array kosong agar aman dari error undefined)
  const [users, setUsers] = useState([]);
  const [program, setProgram] = useState([]);
  const [pendaftaran, setPendaftaran] = useState([]);
  const [kelas, setKelas] = useState([]);
  const [tugas, setTugas] = useState([]);
  const [pengumpulan, setPengumpulan] = useState([]);
  const [penilaian, setPenilaian] = useState([]);
  const [presensi, setPresensi] = useState([]);
  const [notifikasi, setNotifikasi] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Toast Notification
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "success") => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. Real-time Listener Autentikasi & Profil Pengguna users/{uid}
  useEffect(() => {
    let unsubscribeDoc = null;
    let isMounted = true;

    // Safety fallback: Jangan biarkan aplikasi stuck di 'Memverifikasi Hak Akses' lebih dari 3.5 detik
    const fallbackTimer = setTimeout(() => {
      if (isMounted) {
        setIsLoadingAuth(false);
        setIsRoleLoading(false);
      }
    }, 3500);

    // Gunakan authStateReady jika didukung untuk resolusi cepat sesi awal
    if (auth && typeof auth.authStateReady === "function") {
      auth.authStateReady().then(() => {
        if (isMounted && !auth.currentUser) {
          setIsLoadingAuth(false);
          setIsRoleLoading(false);
        }
      }).catch((err) => {
        console.warn("authStateReady:", err);
        if (isMounted) {
          setIsLoadingAuth(false);
          setIsRoleLoading(false);
        }
      });
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!isMounted) return;
      setAuthUser(user);

      if (user) {
        setIsRoleLoading(true);
        const userDocRef = doc(db, "users", user.uid);
        if (unsubscribeDoc) unsubscribeDoc();

        unsubscribeDoc = onSnapshot(
          userDocRef,
          (docSnap) => {
            if (!isMounted) return;
            if (docSnap.exists()) {
              setUserProfile({ id: docSnap.id, ...docSnap.data() });
            } else {
              setUserProfile(null);
            }
            setIsRoleLoading(false);
            setIsLoadingAuth(false);
            clearTimeout(fallbackTimer);
          },
          (error) => {
            console.error("Gagal membaca profil dari Firestore:", error);
            if (isMounted) {
              setIsRoleLoading(false);
              setIsLoadingAuth(false);
              clearTimeout(fallbackTimer);
            }
          }
        );
      } else {
        if (unsubscribeDoc) {
          unsubscribeDoc();
          unsubscribeDoc = null;
        }
        setUserProfile(null);
        setIsRoleLoading(false);
        setIsLoadingAuth(false);
        clearTimeout(fallbackTimer);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimer);
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  // 2. Real-time Listener 7 Koleksi Cloud Firestore (Pengganti Penuh LocalStorage)
  useEffect(() => {
    // Koleksi publik: program
    const unsubProgram = onSnapshot(
      collection(db, "program"),
      (snapshot) => {
        setProgram(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (error) => console.error("Error listening program:", error)
    );

    if (!authUser) {
      setPendaftaran([]);
      setPengumpulan([]);
      setUsers([]);
      setKelas([]);
      setTugas([]);
      setPenilaian([]);
      setPresensi([]);
      setNotifikasi([]);
      setIsLoaded(true);
      return () => {
        unsubProgram();
      };
    }

    const unsubUsers = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        setUsers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (error) => console.error("Error listening users:", error)
    );

    const unsubKelas = onSnapshot(
      collection(db, "kelas"),
      (snapshot) => {
        setKelas(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (error) => console.error("Error listening kelas:", error)
    );

    const unsubTugas = onSnapshot(
      collection(db, "tugas"),
      (snapshot) => {
        setTugas(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (error) => console.error("Error listening tugas:", error)
    );

    const unsubPenilaian = onSnapshot(
      collection(db, "penilaian"),
      (snapshot) => {
        setPenilaian(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setIsLoaded(true);
      },
      (error) => console.error("Error listening penilaian:", error)
    );

    const unsubPresensi = onSnapshot(
      collection(db, "presensi"),
      (snapshot) => {
        setPresensi(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (error) => console.error("Error listening presensi:", error)
    );

    // Listener Real-time Notifikasi Pengguna Login (isolasi per userId)
    const notifQuery = query(
      collection(db, "notifikasi"),
      where("userId", "==", authUser.uid)
    );

    const unsubNotifikasi = onSnapshot(
      notifQuery,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => {
          const timeA = a.createdAt?.toMillis
            ? a.createdAt.toMillis()
            : a.createdAt?.seconds
            ? a.createdAt.seconds * 1000
            : 0;
          const timeB = b.createdAt?.toMillis
            ? b.createdAt.toMillis()
            : b.createdAt?.seconds
            ? b.createdAt.seconds * 1000
            : 0;
          return timeB - timeA;
        });
        setNotifikasi(list);
      },
      (error) => console.error("Error listening notifikasi:", error)
    );

    // Koleksi dengan isolasi data: pendaftaran & pengumpulan
    const role = userProfile?.role || "siswa";
    const pendaftaranQuery =
      role === "staf" || role === "super_admin"
        ? collection(db, "pendaftaran")
        : query(collection(db, "pendaftaran"), where("siswaId", "==", authUser.uid));

    const unsubPendaftaran = onSnapshot(
      pendaftaranQuery,
      (snapshot) => {
        setPendaftaran(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (error) => console.error("Error listening pendaftaran:", error)
    );

    const pengumpulanQuery =
      role === "tutor" || role === "staf" || role === "super_admin"
        ? collection(db, "pengumpulan")
        : query(collection(db, "pengumpulan"), where("siswaId", "==", authUser.uid));

    const unsubPengumpulan = onSnapshot(
      pengumpulanQuery,
      (snapshot) => {
        setPengumpulan(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (error) => console.error("Error listening pengumpulan:", error)
    );

    return () => {
      unsubProgram();
      unsubUsers();
      unsubKelas();
      unsubTugas();
      unsubPenilaian();
      unsubPresensi();
      unsubNotifikasi();
      unsubPendaftaran();
      unsubPengumpulan();
    };
  }, [authUser, userProfile]);

  const getInitials = (nama) => {
    if (!nama) return "US";
    return nama
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  };

  // Profil pengguna aktif: dibaca langsung dari Firebase Authentication & Firestore secara real-time
  const matchedUserInList = authUser ? users.find((u) => u.id === authUser.uid) : null;
  const activeProfile = userProfile || matchedUserInList;

  const currentUser = authUser
    ? {
        id: authUser.uid,
        uid: authUser.uid,
        nama:
          activeProfile?.nama ||
          authUser.displayName ||
          authUser.email?.split("@")[0] ||
          "Pengguna",
        email: authUser.email,
        role: activeProfile?.role || userProfile?.role || null,
        aktif: activeProfile?.aktif !== false && userProfile?.aktif !== false,
        avatar: getInitials(
          activeProfile?.nama || authUser.displayName || authUser.email || "US"
        ),
        telepon: activeProfile?.telepon || "",
        sekolah: activeProfile?.sekolah || "",
        isFirebaseUser: true,
      }
    : users[0] || {
        id: "",
        uid: "",
        nama: "Tamu",
        email: "",
        role: "siswa",
        avatar: "TM",
        isFirebaseUser: false,
      };

  const logout = async () => {
    try {
      await signOut(auth);
      showToast("Berhasil keluar dari akun.", "info");
      return true;
    } catch (error) {
      console.error("Gagal keluar:", error);
      showToast("Gagal keluar: " + error.message, "error");
      return false;
    }
  };

  // ================= AKSI FIRESTORE LANGSUNG =================

  // 1. Siswa mengajukan program (addDoc ke koleksi pendaftaran)
  // Field wajib: siswaId, programId, status: "menunggu", tanggalDaftar: serverTimestamp()
  const addPendaftaran = async (programId, catatan = "") => {
    if (!currentUser?.id) {
      showToast("Silakan masuk terlebih dahulu untuk mengajukan program.", "error");
      return false;
    }

    const existing = pendaftaran.find(
      (p) => p.siswaId === currentUser.id && p.programId === programId && p.status !== "ditolak"
    );
    if (existing) {
      showToast("Anda sudah memiliki pengajuan untuk program ini!", "error");
      return false;
    }

    try {
      const newPendaftaran = {
        siswaId: currentUser.id,
        programId,
        status: "menunggu",
        tanggalDaftar: serverTimestamp(),
        catatan: catatan || "Pengajuan keikutsertaan mandiri melalui portal.",
      };
      await addDoc(collection(db, "pendaftaran"), newPendaftaran);
      showToast("Pengajuan program berhasil dikirim! Menunggu verifikasi staf.", "success");
      return true;
    } catch (err) {
      console.error("Gagal mengajukan program:", err);
      showToast("Gagal mengirim pengajuan: " + err.message, "error");
      return false;
    }
  };

  // 2. Staf verifikasi pendaftaran (updateDoc ke koleksi pendaftaran)
  // Mengubah status menjadi "disetujui" (atau status lain) dengan feedback
  const updatePendaftaranStatus = async (pendaftaranId, newStatus, catatanStaf = "") => {
    try {
      const updateData = {
        status: newStatus,
        tanggalDitinjau: serverTimestamp(),
      };
      if (catatanStaf) {
        updateData.catatanStaf = catatanStaf;
      }
      await updateDoc(doc(db, "pendaftaran", pendaftaranId), updateData);
      showToast(
        `Status pendaftaran berhasil diubah menjadi: ${newStatus.toUpperCase()}`,
        newStatus === "disetujui" || newStatus === "aktif" ? "success" : "info"
      );

      // Pemicu Notifikasi Otomatis: Staf menyetujui pendaftaran siswa
      if (newStatus === "disetujui" || newStatus === "aktif") {
        const targetPendaftaran = pendaftaran.find((p) => p.id === pendaftaranId);
        if (targetPendaftaran?.siswaId) {
          const prog = program.find((pr) => pr.id === targetPendaftaran.programId);
          const progName = prog?.judul || prog?.nama || "program pilihan";
          await sendNotification({
            userId: targetPendaftaran.siswaId,
            pesan: `Selamat! Pengajuan pendaftaran Anda untuk "${progName}" telah disetujui staf admisi.`,
            tautan: "/beranda/program",
          });
        }
      }

      return true;
    } catch (err) {
      console.error("Gagal update pendaftaran:", err);
      showToast("Gagal mengubah status pendaftaran: " + err.message, "error");
      return false;
    }
  };

  // 3. Staf tempatkan siswa ke kelas (updateDoc ke koleksi kelas)
  // Memperbarui array siswaIds di dokumen rombongan belajar
  const assignSiswaKelas = async (kelasId, siswaId) => {
    const targetKelas = kelas.find((k) => k.id === kelasId);
    if (!targetKelas) {
      showToast("Kelas tidak ditemukan.", "error");
      return false;
    }
    const currentList = Array.isArray(targetKelas.siswaIds) ? targetKelas.siswaIds : [];
    if (currentList.includes(siswaId)) {
      showToast("Siswa sudah berada di dalam kelas ini.", "info");
      return true;
    }

    try {
      await updateDoc(doc(db, "kelas", kelasId), {
        siswaIds: [...currentList, siswaId],
      });
      showToast("Berhasil menempatkan siswa ke kelas.", "success");
      return true;
    } catch (err) {
      console.error("Gagal menempatkan siswa:", err);
      showToast("Gagal menempatkan siswa: " + err.message, "error");
      return false;
    }
  };

  // 4. Staf perbarui / pastikan tutorId terikat dengan benar pada kelas
  const updateKelasTutor = async (kelasId, tutorId) => {
    try {
      await updateDoc(doc(db, "kelas", kelasId), {
        tutorId,
      });
      showToast("Tutor pengampu berhasil diperbarui untuk kelas ini.", "success");
      return true;
    } catch (err) {
      console.error("Gagal memperbarui tutor kelas:", err);
      showToast("Gagal memperbarui tutor: " + err.message, "error");
      return false;
    }
  };

  // 5. Staf keluarkan siswa dari kelas (updateDoc ke koleksi kelas)
  const removeSiswaFromKelas = async (kelasId, siswaId) => {
    const targetKelas = kelas.find((k) => k.id === kelasId);
    if (!targetKelas) return false;
    const currentList = Array.isArray(targetKelas.siswaIds) ? targetKelas.siswaIds : [];

    try {
      await updateDoc(doc(db, "kelas", kelasId), {
        siswaIds: currentList.filter((id) => id !== siswaId),
      });
      showToast("Siswa berhasil dikeluarkan dari kelas.", "info");
      return true;
    } catch (err) {
      console.error("Gagal mengeluarkan siswa:", err);
      showToast("Gagal mengeluarkan siswa: " + err.message, "error");
      return false;
    }
  };

  // 6. Tutor membuat tugas baru (addDoc ke koleksi tugas)
  // Field wajib: kelasId, judul, deskripsi (rich-text), tenggatWaktu (timestamp)
  const addTugas = async ({ kelasId, judul, deskripsi, tenggatWaktu, bobotNilai = 100 }) => {
    try {
      let deadlineTimestamp = null;
      if (tenggatWaktu) {
        const parsedDate = new Date(tenggatWaktu);
        deadlineTimestamp = !isNaN(parsedDate.getTime())
          ? Timestamp.fromDate(parsedDate)
          : tenggatWaktu;
      }

      const newTugas = {
        kelasId,
        judul,
        deskripsi: deskripsi || "",
        tenggatWaktu: deadlineTimestamp || serverTimestamp(),
        bobotNilai: Number(bobotNilai) || 100,
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, "tugas"), newTugas);
      showToast(`Tugas "${judul}" berhasil dipublikasikan untuk kelas!`, "success");

      // Pemicu Notifikasi Otomatis: Tutor mempublikasikan tugas baru ke siswa rombel kelas
      if (kelasId) {
        const targetKelas = kelas.find((k) => k.id === kelasId);
        const siswaList = Array.isArray(targetKelas?.siswaIds) ? targetKelas.siswaIds : [];
        if (siswaList.length > 0) {
          await Promise.all(
            siswaList.map((sId) =>
              sendNotification({
                userId: sId,
                pesan: `Tugas baru "${judul}" telah dipublikasikan untuk kelas ${targetKelas?.nama || "Anda"}.`,
                tautan: "/beranda/tugas",
              })
            )
          );
        }
      }

      return { id: docRef.id, ...newTugas };
    } catch (err) {
      console.error("Gagal membuat tugas:", err);
      showToast("Gagal mempublikasikan tugas: " + err.message, "error");
      return null;
    }
  };

  // 7. Siswa mengumpulkan tugas (addDoc atau updateDoc ke koleksi pengumpulan)
  // Field wajib: tugasId, siswaId, jawaban (teks atau link dokumen), tanggalKumpul: serverTimestamp()
  const submitTugas = async (tugasId, jawaban) => {
    if (!currentUser?.id) {
      showToast("Silakan login terlebih dahulu untuk mengumpulkan tugas.", "error");
      return false;
    }

    const trimmedJawaban = typeof jawaban === "string" ? jawaban.trim() : "";
    if (!trimmedJawaban) {
      showToast("Jawaban tugas (teks atau tautan dokumen) wajib diisi.", "error");
      return false;
    }

    const existing = pengumpulan.find(
      (p) => p.tugasId === tugasId && p.siswaId === currentUser.id
    );

    try {
      if (existing) {
        await updateDoc(doc(db, "pengumpulan", existing.id), {
          jawaban: trimmedJawaban,
          tanggalKumpul: serverTimestamp(),
        });
        showToast("Revisi jawaban tugas berhasil diperbarui!", "success");
      } else {
        await addDoc(collection(db, "pengumpulan"), {
          tugasId,
          siswaId: currentUser.id,
          jawaban: trimmedJawaban,
          tanggalKumpul: serverTimestamp(),
        });
        showToast("Tugas berhasil dikumpulkan tepat waktu!", "success");
      }
      return true;
    } catch (err) {
      console.error("Gagal submit tugas:", err);
      showToast("Gagal mengumpulkan tugas: " + err.message, "error");
      return false;
    }
  };

  // 8. Tutor menilai tugas (addDoc atau updateDoc ke koleksi penilaian)
  // Field wajib: pengumpulanId, nilai (number 0-100), catatanTutor, tanggalNilai: serverTimestamp()
  const gradeTugas = async (pengumpulanId, nilai, catatanTutor = "") => {
    const numNilai = Number(nilai);
    if (isNaN(numNilai) || numNilai < 0 || numNilai > 100) {
      showToast("Nilai harus berupa angka antara 0 sampai 100.", "error");
      return false;
    }

    const existing = penilaian.find((p) => p.pengumpulanId === pengumpulanId);

    try {
      if (existing) {
        await updateDoc(doc(db, "penilaian", existing.id), {
          nilai: numNilai,
          catatanTutor: catatanTutor || "",
          tanggalNilai: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "penilaian"), {
          pengumpulanId,
          nilai: numNilai,
          catatanTutor: catatanTutor || "",
          tanggalNilai: serverTimestamp(),
        });
      }
      showToast(`Nilai (${numNilai}/100) dan catatan evaluasi edukatif berhasil disimpan!`, "success");

      // Pemicu Notifikasi Otomatis: Tutor memberikan nilai pada pengumpulan tugas siswa
      const targetPengumpulan = pengumpulan.find((p) => p.id === pengumpulanId);
      if (targetPengumpulan?.siswaId) {
        const relatedTugas = tugas.find((t) => t.id === targetPengumpulan.tugasId);
        const tugasTitle = relatedTugas?.judul || "tugas";
        await sendNotification({
          userId: targetPengumpulan.siswaId,
          pesan: `Tugas "${tugasTitle}" Anda telah dinilai oleh tutor dengan perolehan skor ${numNilai}/100.`,
          tautan: "/beranda/nilai",
        });
      }

      return true;
    } catch (err) {
      console.error("Gagal menilai tugas:", err);
      showToast("Gagal menyimpan nilai: " + err.message, "error");
      return false;
    }
  };

  // 9. Super Admin ubah hak akses / role pengguna (updateDoc ke koleksi users)
  const updateUserRole = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      showToast(`Peran pengguna berhasil diubah menjadi "${newRole}" di Firestore.`, "success");
      return true;
    } catch (err) {
      console.error("Gagal mengubah role:", err);
      showToast("Gagal memperbarui peran: " + err.message, "error");
      return false;
    }
  };

  // 10. Super Admin ubah status aktif/nonaktif pengguna (updateDoc ke koleksi users)
  const updateUserStatus = async (userId, newStatus) => {
    try {
      await updateDoc(doc(db, "users", userId), { aktif: newStatus });
      showToast(
        `Status akun berhasil diubah menjadi "${newStatus ? "Aktif" : "Nonaktif"}" di Firestore.`,
        newStatus ? "success" : "info"
      );
      return true;
    } catch (err) {
      console.error("Gagal mengubah status akun:", err);
      showToast("Gagal memperbarui status akun: " + err.message, "error");
      return false;
    }
  };

  // 10.1 Super Admin Tambah Pengguna Baru
  const addUser = async ({
    nama,
    email,
    role = "siswa",
    telepon = "",
    sekolah = "",
    divisi = "",
    bidang = "",
  }) => {
    if (!nama?.trim() || !email?.trim()) {
      showToast("Nama lengkap dan email wajib diisi.", "error");
      return false;
    }
    try {
      const newDocRef = doc(collection(db, "users"));
      const docData = {
        id: newDocRef.id,
        nama: nama.trim(),
        email: email.trim().toLowerCase(),
        role: role || "siswa",
        telepon: telepon.trim(),
        noHp: telepon.trim(),
        sekolah: sekolah.trim(),
        divisi: divisi.trim(),
        bidang: bidang.trim(),
        aktif: true,
        avatar: nama.trim().slice(0, 2).toUpperCase(),
        createdAt: new Date().toISOString(),
      };
      await setDoc(newDocRef, docData);
      showToast(`Pengguna "${nama}" berhasil ditambahkan ke Cloud Firestore.`, "success");
      return newDocRef.id;
    } catch (err) {
      console.error("Gagal menambahkan pengguna:", err);
      showToast("Gagal menambahkan pengguna: " + err.message, "error");
      return false;
    }
  };

  // 10.2 Super Admin Perbarui Data Pengguna Lengkap
  const updateUserData = async (userId, data) => {
    if (!userId) return false;
    try {
      const updatePayload = { ...data };
      if (updatePayload.nama) {
        updatePayload.avatar = updatePayload.nama.trim().slice(0, 2).toUpperCase();
      }
      if (updatePayload.telepon) {
        updatePayload.noHp = updatePayload.telepon;
      }
      updatePayload.updatedAt = new Date().toISOString();
      await updateDoc(doc(db, "users", userId), updatePayload);
      showToast("Data profil pengguna berhasil diperbarui di Cloud Firestore.", "success");
      return true;
    } catch (err) {
      console.error("Gagal memperbarui pengguna:", err);
      showToast("Gagal memperbarui data pengguna: " + err.message, "error");
      return false;
    }
  };

  // 10.3 Super Admin Hapus Akun Pengguna
  const deleteUser = async (userId) => {
    if (!userId) return false;
    if (userId === currentUser?.id || userId === authUser?.uid) {
      showToast("Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan.", "error");
      return false;
    }
    try {
      await deleteDoc(doc(db, "users", userId));
      showToast("Akun pengguna berhasil dihapus dari Cloud Firestore.", "success");
      return true;
    } catch (err) {
      console.error("Gagal menghapus pengguna:", err);
      showToast("Gagal menghapus akun pengguna: " + err.message, "error");
      return false;
    }
  };

  // 10.4 Super Admin / Staf Tambah Program Bimbel Baru
  const addProgram = async ({
    nama,
    deskripsi,
    biaya,
    durasi,
    target,
    kuota,
    fasilitas,
  }) => {
    if (!nama?.trim() || !deskripsi?.trim()) {
      showToast("Nama dan deskripsi program bimbingan wajib diisi.", "error");
      return false;
    }
    try {
      const newDocRef = doc(collection(db, "program"));
      const parsedFasilitas = Array.isArray(fasilitas)
        ? fasilitas
        : typeof fasilitas === "string"
        ? fasilitas.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

      const formatBiaya = (b) => {
        if (!b) return "Rp 0";
        if (typeof b === "string" && b.startsWith("Rp")) return b;
        const num = Number(String(b).replace(/[^0-9]/g, ""));
        return isNaN(num) || num === 0 ? String(b) : `Rp ${num.toLocaleString("id-ID")}`;
      };

      const docData = {
        id: newDocRef.id,
        nama: nama.trim(),
        deskripsi: deskripsi.trim(),
        biaya: formatBiaya(biaya),
        durasi: durasi?.trim() || "1 Bulan",
        target: target?.trim() || "Semua Jenjang",
        kuota: Number(kuota) || 30,
        fasilitas: parsedFasilitas,
        createdAt: serverTimestamp(),
      };
      await setDoc(newDocRef, docData);
      showToast(`Program "${nama}" berhasil dipublikasikan ke katalog.`, "success");
      return newDocRef.id;
    } catch (err) {
      console.error("Gagal menambahkan program:", err);
      showToast("Gagal menambahkan program: " + err.message, "error");
      return false;
    }
  };

  // 10.5 Super Admin / Staf Perbarui Program Bimbel
  const updateProgram = async (
    programId,
    { nama, deskripsi, biaya, durasi, target, kuota, fasilitas }
  ) => {
    if (!programId) return false;
    try {
      const formatBiaya = (b) => {
        if (!b) return "Rp 0";
        if (typeof b === "string" && b.startsWith("Rp")) return b;
        const num = Number(String(b).replace(/[^0-9]/g, ""));
        return isNaN(num) || num === 0 ? String(b) : `Rp ${num.toLocaleString("id-ID")}`;
      };

      const parsedFasilitas = Array.isArray(fasilitas)
        ? fasilitas
        : typeof fasilitas === "string"
        ? fasilitas.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined;

      const updatePayload = {};
      if (nama !== undefined) updatePayload.nama = nama.trim();
      if (deskripsi !== undefined) updatePayload.deskripsi = deskripsi.trim();
      if (biaya !== undefined) updatePayload.biaya = formatBiaya(biaya);
      if (durasi !== undefined) updatePayload.durasi = durasi.trim();
      if (target !== undefined) updatePayload.target = target.trim();
      if (kuota !== undefined) updatePayload.kuota = Number(kuota) || 0;
      if (parsedFasilitas !== undefined) updatePayload.fasilitas = parsedFasilitas;
      updatePayload.updatedAt = serverTimestamp();

      await updateDoc(doc(db, "program", programId), updatePayload);
      showToast("Detail program bimbingan belajar berhasil diperbarui.", "success");
      return true;
    } catch (err) {
      console.error("Gagal memperbarui program:", err);
      showToast("Gagal memperbarui program: " + err.message, "error");
      return false;
    }
  };

  // 10.6 Super Admin / Staf Hapus Program Bimbel
  const deleteProgram = async (programId) => {
    if (!programId) return false;
    try {
      await deleteDoc(doc(db, "program", programId));
      showToast("Program bimbingan belajar berhasil dihapus dari katalog.", "success");
      return true;
    } catch (err) {
      console.error("Gagal menghapus program:", err);
      showToast("Gagal menghapus program: " + err.message, "error");
      return false;
    }
  };

  // 11. Pencatatan Presensi Kehadiran Kelas (addDoc ke koleksi presensi)
  const recordPresensi = async ({ kelasId, tanggal, daftarHadir }) => {
    try {
      if (!kelasId) {
        showToast("Pilih rombongan belajar terlebih dahulu.", "error");
        return false;
      }
      const docData = {
        kelasId,
        tanggal: tanggal || new Date().toISOString(),
        daftarHadir: Array.isArray(daftarHadir) ? daftarHadir : [],
        tutorId: currentUser?.id || authUser?.uid,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, "presensi"), docData);
      showToast("Presensi kehadiran berhasil disimpan ke Firestore.", "success");
      return true;
    } catch (err) {
      console.error("Gagal mencatat presensi:", err);
      showToast("Gagal menyimpan presensi: " + err.message, "error");
      return false;
    }
  };

  // 12. Sistem Notifikasi In-App (Lonceng Notifikasi)
  const sendNotification = async ({ userId, pesan, tautan = "/beranda" }) => {
    if (!userId || !pesan) return null;
    try {
      const docRef = await addDoc(collection(db, "notifikasi"), {
        userId,
        pesan,
        dibaca: false,
        tautan,
        Tautan: tautan,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (err) {
      console.error("Gagal mengirim notifikasi:", err);
      return null;
    }
  };

  const markNotificationAsRead = async (notifId) => {
    try {
      await updateDoc(doc(db, "notifikasi", notifId), {
        dibaca: true,
      });
      return true;
    } catch (err) {
      console.error("Gagal menandai notifikasi dibaca:", err);
      return false;
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const unreadList = notifikasi.filter((n) => !n.dibaca);
      if (unreadList.length === 0) return true;
      await Promise.all(
        unreadList.map((n) =>
          updateDoc(doc(db, "notifikasi", n.id), { dibaca: true })
        )
      );
      showToast("Semua notifikasi berhasil ditandai telah dibaca.", "info");
      return true;
    } catch (err) {
      console.error("Gagal menandai semua notifikasi:", err);
      return false;
    }
  };

  // 13. Forum Diskusi / Tanya Jawab Interaktif per Tugas
  const addDiskusiTugas = async ({ tugasId, pesan }) => {
    if (!currentUser?.id || !pesan?.trim()) {
      showToast("Pesan diskusi tidak boleh kosong.", "error");
      return false;
    }
    try {
      await addDoc(collection(db, "diskusi_tugas"), {
        tugasId,
        pengirimId: currentUser.id,
        namaPengirim: currentUser.nama || "Pengguna",
        rolePengirim: currentUser.role || "siswa",
        pesan: pesan.trim(),
        createdAt: serverTimestamp(),
      });
      return true;
    } catch (err) {
      console.error("Gagal mengirim diskusi:", err);
      showToast("Gagal mengirim pesan: " + err.message, "error");
      return false;
    }
  };

  // 14. Kuis CBT & Hasil Latihan Soal
  const saveHasilKuis = async ({
    kuisId,
    jawabanSiswa,
    skor,
    totalSoal,
    waktuPengerjaanDetik,
  }) => {
    if (!currentUser?.id) return null;
    try {
      const docRef = await addDoc(collection(db, "hasil_kuis"), {
        kuisId,
        siswaId: currentUser.id,
        namaSiswa: currentUser.nama || "Siswa",
        jawabanSiswa: Array.isArray(jawabanSiswa) ? jawabanSiswa : [],
        skor: Number(skor) || 0,
        totalSoal: Number(totalSoal) || 0,
        waktuPengerjaanDetik: Number(waktuPengerjaanDetik) || 0,
        selesaiPada: serverTimestamp(),
      });
      showToast(`Hasil kuis berhasil disimpan! Skor Anda: ${skor}`, "success");
      return docRef.id;
    } catch (err) {
      console.error("Gagal menyimpan hasil kuis:", err);
      showToast("Gagal menyimpan hasil kuis: " + err.message, "error");
      return null;
    }
  };

  // 15. Pembersihan Data Pengguna Tiruan / Duplikat (Database Cleanup)
  const cleanupDuplicateUsers = async () => {
    try {
      const OFFICIAL_UIDS = {
        super_admin: "RjKtSMKlAHfBRVgpuuEVu6I2jsJ3", // admin@langkahjuara.id
        staf: "QWaw392xoGOV8PAA0uYwcG2yiMQ2",        // staf@langkahjuara.id
        tutor: "JEWXKcYZvtagspeoMoYW3LWr7kO2",       // tutor@langkahjuara.id
        siswa: "PiU6GDhxFkT8aJERKAelVDTOa9C2",       // siswa@langkahjuara.id
      };
      const preservedSet = new Set(Object.values(OFFICIAL_UIDS));

      // 1. Sanitasi relasi kelas
      const kelasSnap = await getDocs(collection(db, "kelas"));
      for (const d of kelasSnap.docs) {
        await updateDoc(doc(db, "kelas", d.id), {
          tutorId: OFFICIAL_UIDS.tutor,
          siswaIds: [OFFICIAL_UIDS.siswa],
        });
      }

      // 2. Sanitasi relasi pengumpulan
      const submitSnap = await getDocs(collection(db, "pengumpulan"));
      for (const d of submitSnap.docs) {
        await updateDoc(doc(db, "pengumpulan", d.id), {
          siswaId: OFFICIAL_UIDS.siswa,
        });
      }

      // 3. Bersihkan pendaftaran usang
      const pendaftaranSnap = await getDocs(collection(db, "pendaftaran"));
      for (const d of pendaftaranSnap.docs) {
        if (!preservedSet.has(d.data().siswaId)) {
          await deleteDoc(doc(db, "pendaftaran", d.id));
        }
      }

      // 4. Hapus pengguna selain 4 akun resmi
      const usersSnap = await getDocs(collection(db, "users"));
      let deletedCount = 0;
      for (const d of usersSnap.docs) {
        if (!preservedSet.has(d.id)) {
          await deleteDoc(doc(db, "users", d.id));
          deletedCount++;
        }
      }

      showToast(`Pembersihan database selesai! ${deletedCount} akun dibersihkan, 4 akun resmi dipertahankan.`, "success");
      return { success: true, deletedCount };
    } catch (err) {
      console.error("Gagal melakukan pembersihan database:", err);
      showToast("Gagal melakukan pembersihan database: " + err.message, "error");
      return { success: false, error: err.message };
    }
  };

  const value = {
    isLoaded,
    authUser,
    userProfile,
    isLoadingAuth,
    isRoleLoading,
    logout,
    users,
    currentUser,
    program,
    pendaftaran,
    kelas,
    tugas,
    pengumpulan,
    penilaian,
    presensi,
    recordPresensi,
    notifikasi,
    sendNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    addDiskusiTugas,
    saveHasilKuis,
    cleanupDuplicateUsers,
    toasts,
    showToast,
    removeToast,
    addPendaftaran,
    updatePendaftaranStatus,
    assignSiswaKelas,
    updateKelasTutor,
    removeSiswaFromKelas,
    addTugas,
    submitTugas,
    gradeTugas,
    updateUserRole,
    updateUserStatus,
    addUser,
    updateUserData,
    deleteUser,
    addProgram,
    updateProgram,
    deleteProgram,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
