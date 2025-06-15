import { AuthProvider } from "@/context/auth-context";
import Header from "@/components/layout/header";
import { Montserrat } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Footer from "@/components/layout/footer";
import "./globals.css";

import * as fcl from "@onflow/fcl";
import CreatorFixNotification from "@/components/fix-notification";
import ParticleBackground from "@/components/particle-background";

if (typeof window !== "undefined") {
  (window as any).fcl = fcl;
}

const montserrat = Montserrat({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <>
            <div
            className={`min-h-screen bg-slate-950 text-white relative flex flex-col ${montserrat.className}`}
          >
            <Header />
            <ParticleBackground />

            {children}
          </div>
          </>
          <Toaster />
          <CreatorFixNotification />
        </AuthProvider>
      </body>
    </html>
  );
}
