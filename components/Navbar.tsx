"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Icon } from "@iconify/react";

export default function Navbar() {
  const pathname = usePathname() || "/";
  const { user, role } = useApp();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  // Base items always visible
  const navItems = [
    { href: "/", label: "Inicio", icon: "lucide:home" },
    { href: "/solicitud", label: "Ingresar Solicitud", icon: "lucide:mail" },
  ];

  // Conditional items
  if (user) {
    navItems.push({ href: "/perfil", label: "Mi Perfil", icon: "lucide:user" });
  }

  if (role === "Consejero" || role === "Admin_TI") {
    navItems.push({ href: "/admin", label: "Admin", icon: "lucide:settings" });
  }

  return (
    <nav className="fixed top-[10px] left-[30px] right-[30px] z-50">
      <div className="w-full flex items-center justify-between gap-1 sm:gap-2 p-2 rounded-2xl sm:rounded-full glass shadow-2xl shadow-black/10 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <Link href="/" className="flex items-center gap-2.5 px-3">
          <img src="/logo.svg" alt="Logo" className="w-[121px] h-[40px] object-contain drop-shadow-md" />
          <span className="font-bold text-sm hidden lg:block">Sede Viña del Mar</span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center justify-center h-10 rounded-xl sm:rounded-full transition-all duration-300 ease-out px-3 sm:px-4 ${
                  isActive
                    ? "bg-indigo-100 border border-indigo-200 text-indigo-700 shadow-inner"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                }`}
              >
                <Icon 
                  icon={item.icon} 
                  className={`shrink-0 w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 transition-transform duration-300 ${
                    isActive ? "scale-110" : "scale-100 group-hover:scale-110"
                  }`} 
                />
                <span className="font-semibold text-xs sm:text-sm whitespace-nowrap">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
