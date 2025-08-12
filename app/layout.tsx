import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { ClientProviders } from "./providers/ClientProviders";
import { RouteLoadingProvider } from "./components/providers/RouteLoadingProvider";
import ToastProvider from "./providers/ToastProvider";
import GlobalLoading from "./components/ui/GlobalLoading/GlobalLoading";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Babel Edit",
  description: "An elegant clothing store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ClientProviders>
            <RouteLoadingProvider>
              {children}
              <GlobalLoading />
              <ToastProvider />
            </RouteLoadingProvider>
          </ClientProviders>
        </AuthProvider>
      </body>
    </html>
  );
}
