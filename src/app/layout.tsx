import type { Metadata } from "next";
import "@fontsource-variable/source-serif-4";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://aurostars.github.io"),
  title: "董星 | AI 产品与独立创造",
  description: "董星的沉浸式个人主页，展示 AI 产品经历、独立项目与真实产品实践。",
  openGraph: {
    title: "董星 | AI 产品与独立创造",
    description: "查看董星的 AI 产品经历、独立项目与沉浸式数字作品。",
    url: "https://aurostars.github.io",
    siteName: "董星 | AI 产品与独立创造",
    locale: "zh_CN",
    type: "website",
    images: [
      {
        url: "/og-portfolio.png",
        width: 1200,
        height: 630,
        alt: "董星的 AI 产品案例作品集",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${GeistSans.variable} antialiased`}>
      <body>
        <a className="skip-link" href="#main-content">
          跳到主要内容
        </a>
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
