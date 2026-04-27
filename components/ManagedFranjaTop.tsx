"use client";

import React from "react";
import { usePathname } from "next/navigation";
import FranjaTop from "./FranjaTop";

export default function ManagedFranjaTop() {
  const pathname = usePathname();

  // No mostrar en el panel de administración
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <div className="w-full mt-[-35px] sm:mt-[-85px] relative z-[40]">
      <FranjaTop />
    </div>
  );
}
