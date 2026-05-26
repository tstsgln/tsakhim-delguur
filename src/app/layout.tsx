import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UnverifiedBanner from "@/components/UnverifiedBanner";
import { CartProvider } from "@/lib/cart-context";
import { getSessionUser } from "@/lib/session";
import { db } from "@/lib/db";
import { getUnreadCount } from "@/lib/chat-db";
import { getUnreadNotificationCount } from "@/lib/notifications-db";
import { isAdmin } from "@/lib/admin";

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
  const unreadCount = user ? getUnreadCount(user.id) : 0;
  const notificationCount = user ? getUnreadNotificationCount(user.id) : 0;
  const userIsAdmin = isAdmin(user);
  return (
    <html lang="mn" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <Header user={user} isSeller={isSeller} unreadCount={unreadCount} notificationCount={notificationCount} isAdmin={userIsAdmin} />
          {user && !user.emailVerified && <UnverifiedBanner email={user.email} />}
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
