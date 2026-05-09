"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
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
    { href: "/solicitud", label: "Solicitud", icon: "lucide:mail" },
  ];

  // Conditional items
  if (user) {
    navItems.push({ href: "/perfil", label: "Mi Perfil", icon: "lucide:user" });
  } else {
    navItems.push({ href: "/login", label: "Iniciar Sesión", icon: "lucide:log-in" });
  }

  if (role && role !== "Estudiante") {
    navItems.push({ href: "/admin", label: "Admin", icon: "lucide:settings" });
  }

  return (
    <>
      {/* Standard Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200" aria-label="Navegación principal">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 sm:h-20 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 sm:gap-4 shrink-0" aria-label="Volver al inicio">
            <Image 
              src="/logo.svg" 
              alt="Logo Duoc UC" 
              width={120} 
              height={40} 
              className="object-contain w-[100px] h-[32px] sm:w-[140px] sm:h-[45px]" 
              priority
            />
            <div className="hidden md:flex flex-col border-l border-slate-200 pl-4">
              <span className="font-black text-slate-800 text-sm tracking-tight leading-none">Consejo de Carrera</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Sede Viña del Mar</span>
            </div>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-[#E07A5F] text-white shadow-md shadow-[#E07A5F]/20"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-bold"
                  }`}
                  aria-label={`Ir a ${item.label}`}
                >
                  <Icon 
                    icon={item.icon} 
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-800"}`} 
                  />
                  <span className="text-xs sm:text-sm font-bold whitespace-nowrap">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
