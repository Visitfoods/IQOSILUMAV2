"use client";

import { ReactNode } from "react";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <div className="relative w-full h-full">
      {children}
    </div>
  );
} 