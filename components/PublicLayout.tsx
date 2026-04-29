import React from "react";
import Footer from "./Footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[100dvh] overflow-hidden flex flex-col bg-transparent">
      <main className="flex-1 overflow-y-auto custom-scrollbar pt-0 sm:pt-20 flex flex-col">
        <div className="shrink-0">
          {children}
        </div>
        <Footer />
      </main>
    </div>
  );
}
