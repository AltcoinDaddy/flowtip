import { AuthProvider } from "@/context/auth-context";
import Header from "@/components/layout/header";
import { Montserrat } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Footer from "@/components/layout/footer";
import "./globals.css";

import * as fcl from "@onflow/fcl"
import CreatorFixNotification from "@/components/fix-notification";

if (typeof window !== 'undefined') {
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
          <div
            className={`min-h-screen flex flex-col bg-white ${montserrat.className}`}
          >
            <Header />
            <main className="flex-grow py-8 px-4">{children}</main>
            {/* <Footer /> */}
          </div>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "#363636",
                color: "#fff",
                borderRadius: "12px",
                padding: "16px",
                fontSize: "14px",
                fontWeight: "500",
              },
              success: {
                iconTheme: {
                  primary: "#10B981",
                  secondary: "#fff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#EF4444",
                  secondary: "#fff",
                },
              },
            }}
          />

          <CreatorFixNotification />
        </AuthProvider>
      </body>
    </html>
  );
}
