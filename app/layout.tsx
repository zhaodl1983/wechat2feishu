import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WeChat Archiver",
  description: "Archiving WeChat articles locally.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
