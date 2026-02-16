import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/common/Header";
import { Toaster } from "react-hot-toast";

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
            {/* 背景レイヤー全体 */}
            <body className={`${inter.className} min-h-screen`}>
                <div className="relative w-full min-h-screen">

                    {/* 背景画像 */}
                    <div
                        className="
                        absolute inset-0
                        bg-cover bg-center bg-fixed
                        bg-[url('/backgrounds/bg-mobile.png')]
                        md:bg-[url('/backgrounds/bg-desktop.png')]
                        brightness-90
                        min-h-[120vh]
                        "
                    />

                    {/* オーバーレイ（読みやすさUP） */}
                    <div className="absolute inset-0 bg-white/20 md:bg-white/10" />

                    {/* コンテンツ（Header, children すべてここ） */}
                    <div className="relative z-10">
                        <AuthProvider>
                            <Header />
                            <Toaster position="top-center" />
                            {children}
                        </AuthProvider>
                    </div>

                </div>
            </body>
        </html>
    );
}