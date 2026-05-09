"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import { useApp } from "@/context/AppContext";
import type { AdminRole } from "@/context/AppContext";

const navItems = [
  { href: "/admin", label: "Inicio", icon: "lucide:home", exact: true },
  { href: "/admin/users", label: "Usuarios", icon: "lucide:users", roles: ["Admin TI", "Admin_TI"] },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { role, user, tickets } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true;
    return role && item.roles.includes(role);
  });

  const roleLabels: Record<string, string> = {
    Supervisor: "Supervisor General",
    Consejo: "Consejo de Sede",
    "Admin TI": "Administrador TI",
    Admin_TI: "Administrador TI",
  };

  const roleLabel = role ? roleLabels[role] || "Staff" : "Cargando...";

  // Navigation logic
  const router = require("next/navigation").useRouter();

  useEffect(() => {
    if (role === "Estudiante") {
      router.push("/perfil");
    }
  }, [role, router]);

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  // Skip the admin shell for the login page
  if (pathname === "/admin/login") {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  // Si el usuario no tiene rol aún (cargando) o es estudiante, no mostrar el contenido del panel.
  // El middleware ya se encarga de redirigir si no hay usuario del todo.
  if (!role || role === "Estudiante") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black flex">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed top-0 left-0 h-full z-40 transition-all duration-300 bg-white border-r border-border ${
          collapsed ? "w-[72px]" : "w-[260px]"
        }`}
        aria-label="Barra lateral administrativa"
      >
        {/* Logo */}
        <div className={`h-16 flex items-center border-b border-border px-4 ${collapsed ? "justify-center" : "gap-3"}`}>
          <Image 
            src="/logo.svg" 
            alt="Logo Duoc UC" 
            width={collapsed ? 32 : 121}
            height={collapsed ? 32 : 40}
            className="object-contain drop-shadow-md transition-all duration-300" 
            priority
          />
          {!collapsed && (
            <div className="animate-fade-in">
              <div className="font-bold text-sm leading-tight">Panel Administrativo</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {filteredNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive(item)
                  ? "bg-indigo-500/15 text-indigo-500-light shadow-sm"
                  : "text-foreground hover:text-foreground hover:bg-foreground/5"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <span className={`text-lg shrink-0 ${isActive(item) ? "" : "group-hover:scale-110 transition-transform"}`}>
                <Icon icon={item.icon} className="w-5 h-5" />
              </span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Collapse toggle */}
        <div className="border-t border-border p-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-foreground hover:text-background hover:bg-foreground transition-all text-sm"
          >
            <svg className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M11 19l-7-7 7-7M17 19l-7-7 7-7" />
            </svg>
            {!collapsed && <span>Colapsar</span>}
          </button>

          {/* Back to public */}
          <Link
            href="/"
            className={`mt-1 flex items-center gap-2 px-3 py-2.5 rounded-xl text-foreground hover:text-background hover:bg-foreground transition-all text-sm ${collapsed ? "justify-center" : ""}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {!collapsed && <span>Sitio Público</span>}
          </Link>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-white/95 backdrop-blur-lg border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Logo Duoc UC" width={100} height={33} className="object-contain" />
          <span className="font-bold text-sm">Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Cerrar menú móvil"
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-foreground/5 transition text-foreground/70"
          >
            <Icon icon="lucide:menu" className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="lg:hidden fixed top-14 left-0 bottom-0 w-[260px] z-50 bg-white border-r border-border animate-slide-in-left">
            <nav className="py-4 px-3 space-y-1">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive(item)
                      ? "bg-indigo-500/15 text-indigo-500-light"
                      : "text-foreground hover:text-background hover:bg-foreground"
                  }`}
                >
                  <span className="text-lg"><Icon icon={item.icon} /></span>
                  <span>{item.label}</span>
                </Link>
              ))}
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground hover:text-background hover:bg-foreground transition-all mt-4"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Sitio Público</span>
              </Link>
            </nav>
          </div>
        </>
      )}

      {/* Main content */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${collapsed ? "lg:ml-[72px]" : "lg:ml-[260px]"}`}>
        {/* Topbar */}
        <header className="hidden lg:flex h-16 border-b border-border bg-white items-center justify-end px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest leading-none mb-1">
                {roleLabel}
              </span>
              <span className="text-xs text-slate-500 font-medium max-w-[150px] truncate">
                {user?.email}
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-sm border border-indigo-400/20">
               {user?.email?.[0].toUpperCase() ?? <Icon icon="lucide:user" className="w-5 h-5" />}
            </div>
          </div>
        </header>

        <main className="flex-1 pt-14 lg:pt-0">
          <div className="p-6 lg:p-8">{children}</div>
        </main>
      </div>


    </div>
  );
}
