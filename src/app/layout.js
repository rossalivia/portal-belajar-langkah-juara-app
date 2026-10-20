import "./globals.css";
import { DataProvider } from "../context/DataContext";
import ToastContainer from "../components/Toast";

export const metadata = {
  title: "Portal Belajar Langkah Juara - Learning Management System",
  description:
    "Portal terpadu pendaftaran, penempatan kelas, penugasan, dan penilaian bimbingan belajar Langkah Juara.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <DataProvider>
          {children}
          <ToastContainer />
        </DataProvider>
      </body>
    </html>
  );
}
