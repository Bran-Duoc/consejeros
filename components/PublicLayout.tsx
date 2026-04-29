import React from "react";
import Footer from "./Footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      <main className="flex-1 flex flex-col pt-0 sm:pt-0">
        <div>
          {children}
        </div>
        <Footer />
      </main>
    </div>
  );
}
