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
  }

  if (role === "Consejero" || role === "Admin_TI") {
    navItems.push({ href: "/admin", label: "Admin", icon: "lucide:settings" });
  }

  return (
    <>
      {/* Desktop Navbar — hidden on mobile */}
      <nav className="hidden sm:block fixed top-[10px] left-[30px] right-[30px] z-50" aria-label="Navegación principal">
        <div 
          className="w-full flex items-center justify-between gap-2 p-2 rounded-full glass shadow-2xl shadow-black/10 relative overflow-hidden"
          style={{
            backgroundImage: "url('/franja2.svg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Strong glassmorphism overlay to blur the institutional background */}
          <div className="absolute inset-0 bg-white/30 backdrop-blur-xl -z-10" />
          <Link href="/" className="flex items-center gap-2.5 px-3" aria-label="Volver al inicio">
            <Image 
              src="/logo.svg" 
              alt="Logo Duoc UC" 
              width={121} 
              height={40} 
              className="object-contain drop-shadow-md" 
              priority
            />
            <span className="font-bold text-sm hidden lg:block">Sede Viña del Mar</span>
          </Link>
          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center justify-center h-10 rounded-full transition-all duration-300 ease-out px-4 ${
                    isActive
                      ? "bg-indigo-100 border border-indigo-200 text-indigo-700 shadow-inner"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                  aria-label={`Ir a ${item.label}`}
                >
                  <Icon 
                    icon={item.icon} 
                    className={`shrink-0 w-5 h-5 mr-2 transition-transform duration-300 ${
                      isActive ? "scale-110" : "scale-100 group-hover:scale-110"
                    }`} 
                  />
                  <span className="font-semibold text-sm whitespace-nowrap">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Tab Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]" aria-label="Barra de navegación móvil">
        <div 
          className="glass border-t border-slate-200/60 shadow-[0_-4px_30px_rgba(0,0,0,0.08)] relative overflow-hidden"
          style={{
            backgroundImage: "url('/franja2.svg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Strong glassmorphism overlay */}
          <div className="absolute inset-0 bg-white/30 backdrop-blur-xl -z-10" />
          <div className="flex items-center justify-around px-2 h-16 relative z-10">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "text-indigo-600"
                      : "text-slate-400 active:text-slate-600"
                  }`}
                  aria-label={item.label}
                >
                  <Icon 
                    icon={item.icon} 
                    className={`w-6 h-6 transition-transform ${isActive ? "scale-110" : ""}`}
                  />
                  <span className={`text-[10px] font-semibold ${isActive ? "text-indigo-600" : "text-slate-400"}`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full bg-indigo-600" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
