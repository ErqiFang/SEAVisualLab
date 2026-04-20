import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SEA Visual Lab - 跨境商品视觉工作台",
  description: "面向东南亚电商卖家的商品图片生成工作台，支持主图、辅图和细节图的快速创建与对比。"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
