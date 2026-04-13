import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/layout/Providers";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Toast from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "PrintForge — AI 驅動的 3D 列印平台",
  description:
    "上傳圖片，AI 自動生成 3D 模型，選擇材質、即時報價、一鍵下單。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body>
        <Providers>
          <Navbar />
          <main className="pt-[72px]">{children}</main>
          <Footer />
          <Toast />
        </Providers>
      </body>
    </html>
  );
}
