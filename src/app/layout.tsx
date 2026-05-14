import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/lib/cart-context";
import { getSessionUser } from "@/lib/session";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Цэцэглэн - Монгол гар урлалын зах зээл",
  description: "Монгол гар урлал, уламжлалт бүтээгдэхүүнийг онлайнаар худалдаалах зах зээл. Дээл, үнэт эдлэл, хөгжмийн зэмсэг болон бусад.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();
  const isSeller = user
    ? !!db.prepare('SELECT 1 FROM sellers WHERE user_id = ?').get(user.id)
    : false;
  return (
    <html lang="mn" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <Header user={user} isSeller={isSeller} />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
