import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "sonner";
import QueryProvider from "@/components/query-provider";
import FetchUserDetails from "@/fetchUserDetails";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QuantLab",
  description: "Practice quant finance questions and get better at it.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>

        
      <FetchUserDetails />

      <Toaster />
      <Navbar />
      

      <QueryProvider>
          
      {children}
      </QueryProvider>
      </body>
    </html>
  );
}
