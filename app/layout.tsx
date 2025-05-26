import { AuthProvider } from '@/context/auth-context';
import Header from '@/components/layout/header';
import { Montserrat } from "next/font/google"
import Footer from '@/components/layout/footer';
import './globals.css';

const montserrat = Montserrat({
  subsets: ["latin"]
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className={`min-h-screen flex flex-col bg-white ${montserrat.className}`}>
            <Header />
            <main className="flex-grow py-8 px-4">{children}</main>
            {/* <Footer /> */}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}