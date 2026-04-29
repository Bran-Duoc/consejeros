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
      {/* Unified Top Navbar */}
      <nav className="fixed top-[10px] left-[10px] right-[10px] sm:left-[30px] sm:right-[30px] z-50" aria-label="Navegación principal">
        <div 
          className="w-full flex items-center justify-between gap-2 p-1.5 sm:p-2 rounded-full glass shadow-2xl shadow-black/10 relative overflow-hidden"
          style={{
            backgroundImage: "url('/franja2.svg')",
            backgroundSize: "cover",
            backdropFilter: "blur(1px)",
            WebkitBackdropFilter: "blur(1px)",
          }}
        >
          {/* Strong glassmorphism overlay */}
          <div 
            className="absolute inset-0 bg-white/30 backdrop-blur-xl -z-10" 
            style={{ WebkitBackdropFilter: "blur(24px)" }}
          />
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2.5 px-2 sm:px-3" aria-label="Volver al inicio">
            <Image 
              src="/logo.svg" 
              alt="Logo Duoc UC" 
              width={100} 
              height={32} 
              className="object-contain drop-shadow-md sm:w-[121px] sm:h-[40px]" 
              priority
            />
            <span className="font-bold text-xs sm:text-sm hidden lg:block">Sede Viña del Mar</span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center justify-center h-9 sm:h-10 rounded-full transition-all duration-300 ease-out px-3 sm:px-4 ${
                    isActive
                      ? "bg-indigo-100 border border-indigo-200 text-indigo-700 shadow-inner"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                  aria-label={`Ir a ${item.label}`}
                >
                  <Icon 
                    icon={item.icon} 
                    className={`shrink-0 w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${
                      isActive ? "scale-110" : "scale-100 group-hover:scale-110"
                    } ${item.label === "Inicio" ? "" : "sm:mr-2"}`} 
                  />
                  <span className={`font-semibold text-[10px] sm:text-sm whitespace-nowrap ${item.label === "Inicio" ? "hidden sm:block" : "block"}`}>
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
