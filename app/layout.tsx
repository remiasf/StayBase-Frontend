import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "StayBase | Apartment booking",
  description: "Analog of Booking.com on Next.js and NestJS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50 text-slate-900`}>
        {/* HEADER */}
        <header className="border-b bg-white sticky top-0 z-50">
          <div className="container mx-auto max-w-6xl h-16 flex items-center justify-between px-4">
            <Link
            key={'staybase'}
            href={'/'}>
              <div className="text-2xl font-bold text-blue-600 tracking-tight cursor-pointer">
                StayBase.
              </div>
            </Link>
            <nav className="flex items-center gap-4">
              <button className="text-sm font-medium hover:text-blue-600 transition">Sign in</button>
              <button className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                Sign up
              </button>
            </nav>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-grow">
          {children}
        </main>

        {/* FOOTER */}
        <footer className="border-t bg-white mt-12">
          <div className="container mx-auto max-w-6xl py-6 px-4 text-center text-sm text-slate-500">
            &copy; {new Date().getFullYear()} StayBase. 
          </div>
        </footer>
      </body>
    </html>
  );
}