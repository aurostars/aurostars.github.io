import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://aurostars.github.io"),
  title: "董星 | AI 产品经理与独立开发者",
  description: "董星的 AI 产品经理个人主页，展示网申助手、面试复盘、智能简历和会议纪要等个人项目案例。",
  openGraph: {
    title: "董星 | AI 产品经理与独立开发者",
    description: "从问题定义到结果验证，查看董星的 AI 产品案例。",
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
        <SiteHeader />
        <main id="main-content">{children}</main>
        <footer className="site-footer">
          <div className="site-container footer-inner">
            <p>© 2026 董星</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
