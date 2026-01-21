import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Umania-club | 競馬予想コミュニティ",
    description: "シンプルなUIで楽しむ競馬予想SNS",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ja">
            <body className={`${inter.className} bg-gray-50 min-h-screen`}>{children}</body>
        </html>
    );
}
