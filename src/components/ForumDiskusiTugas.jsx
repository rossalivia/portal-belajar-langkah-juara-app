"use client";

import React, { useState, useEffect, useRef } from "react";
import { db } from "../lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { formatDateTime } from "../lib/dateUtils";
import {
  MessageSquare,
  Send,
  Loader2,
  User,
  ShieldCheck,
  GraduationCap,
  Sparkles,
} from "lucide-react";

export default function ForumDiskusiTugas({ tugasId, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [inputPesan, setInputPesan] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!tugasId) return;

    // Real-time listener koleksi diskusi_tugas untuk tugas yang sedang dibuka
    const q = query(
      collection(db, "diskusi_tugas"),
      where("tugasId", "==", tugasId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Urutkan kronologis (pesan terlama ke terbaru)
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
          return timeA - timeB;
        });

        setMessages(list);
        setLoading(false);
      },
      (err) => {
        console.error("Error listening diskusi_tugas:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [tugasId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const trimmed = inputPesan.trim();
    if (!trimmed || !currentUser?.id) return;

    setIsSending(true);
    try {
      await addDoc(collection(db, "diskusi_tugas"), {
        tugasId,
        pengirimId: currentUser.id,
        namaPengirim: currentUser.nama || "Pengguna",
        rolePengirim: currentUser.role || "siswa",
        pesan: trimmed,
        createdAt: serverTimestamp(),
      });
      setInputPesan("");
      // Auto-scroll ke pesan terbaru
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      console.error("Gagal mengirim pesan diskusi:", err);
    } finally {
      setIsSending(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "tutor":
        return {
          label: "Tutor Pengampu",
          color: "bg-purple-100 text-purple-700 ring-1 ring-purple-600/20",
          icon: GraduationCap,
        };
      case "super_admin":
      case "admin":
        return {
          label: "Super Admin",
          color: "bg-rose-100 text-rose-700 ring-1 ring-rose-600/20",
          icon: ShieldCheck,
        };
      case "staf":
        return {
          label: "Staf Admisi",
          color: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-600/20",
          icon: User,
        };
      default:
        return {
          label: "Siswa",
          color: "bg-blue-100 text-blue-700 ring-1 ring-blue-600/20",
          icon: User,
        };
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Header Forum */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Forum Tanya Jawab & Diskusi Tugas
            </h3>
            <p className="text-xs text-slate-500">
              Ruang tanya jawab interaktif dengan tutor dan rekan sekelas secara real-time.
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
          {messages.length} Komentar
        </span>
      </div>

      {/* Kontainer Daftar Pesan */}
      <div className="p-6 space-y-4 max-h-[420px] overflow-y-auto bg-slate-50/50">
        {loading ? (
          <div className="py-8 flex items-center justify-center text-slate-400 gap-2 text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>Memuat pesan forum diskusi...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="py-8 text-center bg-white rounded-xl border border-dashed border-slate-200 p-6">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">
              Belum Ada Pertanyaan atau Diskusi
            </p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
              Memiliki kendala dalam mengerjakan tugas ini? Tulis pertanyaan Anda di bawah untuk mendapatkan panduan dari tutor bimbingan.
            </p>
          </div>
        ) : (
          messages.map((item) => {
            const isMe = item.pengirimId === currentUser?.id;
            const badge = getRoleBadge(item.rolePengirim);
            const RoleIcon = badge.icon;
            const isTutorOrAdmin =
              item.rolePengirim === "tutor" ||
              item.rolePengirim === "super_admin" ||
              item.rolePengirim === "admin";

            return (
              <div
                key={item.id}
                className={`flex gap-3 text-xs ${isMe ? "justify-end" : "justify-start"}`}
              >
                {!isMe && (
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] text-white shrink-0 mt-0.5 shadow-xs ${
                      isTutorOrAdmin ? "bg-purple-600" : "bg-blue-600"
                    }`}
                  >
                    {(item.namaPengirim || "U").slice(0, 1).toUpperCase()}
                  </div>
                )}

                <div className={`max-w-md ${isMe ? "items-end" : "items-start"}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="font-semibold text-slate-800 text-[11px]">
                      {isMe ? "Anda" : item.namaPengirim}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${badge.color}`}
                    >
                      <RoleIcon className="w-2.5 h-2.5" />
                      {badge.label}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono ml-1">
                      {formatDateTime(item.createdAt)}
                    </span>
                  </div>

                  <div
                    className={`p-3 rounded-2xl leading-relaxed text-xs ${
                      isMe
                        ? "bg-blue-600 text-white rounded-tr-xs shadow-xs"
                        : isTutorOrAdmin
                        ? "bg-purple-50 text-purple-950 border border-purple-200/80 rounded-tl-xs shadow-xs"
                        : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs shadow-xs"
                    }`}
                  >
                    {item.pesan}
                  </div>
                </div>

                {isMe && (
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5 shadow-xs">
                    {(currentUser?.nama || "U").slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Form Input Komentar Baru */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <textarea
              rows={2}
              value={inputPesan}
              onChange={(e) => setInputPesan(e.target.value)}
              placeholder="Tulis pertanyaan atau diskusi seputar tugas ini..."
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={isSending || !inputPesan.trim()}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0 disabled:opacity-50"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kirim</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
