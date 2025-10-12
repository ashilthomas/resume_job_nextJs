import Header from "@/components/Header";
import { Poppins } from 'next/font/google'
import "./globals.css";

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-poppins',
})

export const metadata = {
  title: "AI Resume Portal",
  description: "Smart resume analysis and ATS optimization",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="font-poppins bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900 min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-10">{children}</main>
        <footer className="border-t border-gray-200 bg-white py-8 mt-auto">
          <div className="max-w-7xl mx-auto text-center text-sm text-gray-500 px-4">
            <p className="mb-2">
              © {new Date().getFullYear()}{" "}
              <span className="font-semibold text-black">AI Resume Portal</span>. All rights reserved.
            </p>
            <p>
              <a href="/privacy" className="hover:text-blue-600 transition-colors mr-4">
                Privacy Policy
              </a>
              <a href="/terms" className="hover:text-blue-600 transition-colors">
                Terms of Service
              </a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
