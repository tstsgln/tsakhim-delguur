import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/lib/cart-context";

export const metadata: Metadata = {
  title: "Цахим Дэлгүүр - Монгол гар урлалын зах зээл",
  description: "Монгол гар урлал, уламжлалт бүтээгдэхүүнийг онлайнаар худалдаалах зах зээл. Дээл, үнэт эдлэл, урлаг, хөгжмийн зэмсэг болон бусад.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mn" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
