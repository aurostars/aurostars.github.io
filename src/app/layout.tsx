import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://aurostars.github.io"),
  title: "董星的个人主页",
  description: "董星的个人主页，记录教育与实习经历，并展示独立项目与真实产品实践。",
  openGraph: {
    title: "董星的个人主页",
    description: "查看董星的教育、实习经历与个人项目。",
    url: "https://aurostars.github.io",
    siteName: "董星的个人主页",
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
