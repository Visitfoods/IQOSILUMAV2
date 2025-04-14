import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "../components/ClientLayout";
import Frame from "../components/Frame";

export const metadata: Metadata = {
  title: "ILUMAi",
  description: "ILUMAi - Descobre o teu ILUMAi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt" className="h-full overflow-hidden">
      <body className="h-full overflow-hidden">
        <main className="relative h-screen overflow-hidden">
          <Frame />
          <ClientLayout>{children}</ClientLayout>
        </main>
      </body>
    </html>
  );
}
