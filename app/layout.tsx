import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "ContentFlow — Content Workflow Studio",
  description:
    "CRM/Kanban для блогеров: идеи → сценарии → публикации, с AI-ассистентом. Instagram, YouTube, Threads, ВКонтакте.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "hsl(0 0% 10%)",
              border: "1px solid hsl(0 0% 16%)",
              color: "hsl(0 0% 94%)",
            },
          }}
        />
      </body>
    </html>
  );
}
