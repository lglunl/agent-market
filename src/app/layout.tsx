import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent 超市",
  description: "本机 Agent 展示与管理",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
