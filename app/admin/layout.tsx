"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import { useApp } from "@/context/AppContext";
import type { AdminRole } from "@/context/AppContext";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "lucide:layout-dashboard", exact: true },
  { href: "/admin/kanban", label: "Kanban", icon: "lucide:kanban-square" },
  { href: "/admin/metrics", label: "Métricas", icon: "lucide:bar-chart-3" },
  { href: "/admin/sla", label: "Config SLA", icon: "lucide:settings-2", roles: ["Admin TI", "Admin_TI"] },
  { href: "/admin/users", label: "Usuarios", icon: "lucide:users", roles: ["Admin TI", "Admin_TI"] },
  { href: "/admin/audit", label: "Auditoría", icon: "lucide:scroll-text", roles: ["Admin TI", "Admin_TI", "Supervisor"] },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { role, user, tickets } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdKOpen, setCmdKOpen] = useState(false);
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCmdKOpen((prev) => !prev);
      }
      if (e.key === "Escape") setCmdKOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
            onClick={() => setCmdKOpen(true)}
            aria-label="Abrir búsqueda"
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-foreground/5 transition text-foreground/70"
          >
            <Icon icon="lucide:search" className="w-5 h-5" />
          </button>
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
        <header className="hidden lg:flex h-16 border-b border-border bg-white items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <button
            onClick={() => setCmdKOpen(true)}
            aria-label="Abrir panel de búsqueda"
            className="flex items-center gap-3 px-3 py-1.5 rounded-lg border border-border bg-white text-sm text-black/50 hover:bg-black/5 transition-colors group"
          >
            <Icon icon="lucide:search" className="w-4 h-4" />
            <span>Buscar tickets o alumnos...</span>
            <kbd className="hidden sm:inline-flex px-1.5 py-0.5 rounded-md bg-foreground/5 border border-border text-[10px] font-mono group-hover:bg-foreground/10 transition-colors">
              <span className="mr-0.5">⌘</span>K
            </kbd>
          </button>

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

      {/* Cmd+K Command Palette Modal */}
      {cmdKOpen && (() => {
        const q = searchQuery.trim().toLowerCase();
        const results = q.length > 0 ? tickets.filter((t: any) =>
          t.id?.slice(0, 8).toLowerCase().includes(q) ||
          t.title?.toLowerCase().includes(q) ||
          t.createdByName?.toLowerCase().includes(q) ||
          t.category?.toLowerCase().includes(q) ||
          t.status?.toLowerCase().includes(q) ||
          t.school?.toLowerCase().includes(q) ||
          t.career?.toLowerCase().includes(q)
        ).slice(0, 8) : [];

        const statusIcons: Record<string, string> = {
          nuevo: "lucide:circle", pendiente: "lucide:clock", en_revision: "lucide:eye",
          escalado: "lucide:alert-triangle", resuelto: "lucide:check-circle-2"
        };
        const statusBg: Record<string, string> = {
          nuevo: "bg-sky-100 text-sky-600", pendiente: "bg-indigo-100 text-indigo-600",
          en_revision: "bg-amber-100 text-amber-600", escalado: "bg-rose-100 text-rose-600",
          resuelto: "bg-emerald-100 text-emerald-600"
        };

        return (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] animate-fade-in">
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" onClick={() => { setCmdKOpen(false); setSearchQuery(""); }} aria-hidden="true" />
            <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-border overflow-hidden animate-slide-in-up" role="dialog" aria-label="Búsqueda rápida">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <Icon icon="lucide:search" className="w-5 h-5 text-foreground/40 shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Busca por ID, nombre o palabra clave..."
                  className="flex-1 bg-transparent border-none outline-none text-base text-foreground placeholder:text-foreground/30"
                  aria-label="Campo de búsqueda"
                />
                <kbd className="hidden sm:inline-flex px-1.5 py-0.5 rounded-md bg-foreground/5 border border-border text-[10px] font-mono text-foreground/50">ESC</kbd>
              </div>
              <div className="p-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {q.length > 0 ? (
                  results.length > 0 ? (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-foreground/40 mb-2 px-2 uppercase tracking-wider">{results.length} resultado{results.length !== 1 ? 's' : ''}</p>
                      {results.map((t: any) => (
                        <button
                          key={t.id}
                          onClick={() => { setCmdKOpen(false); setSearchQuery(""); window.location.href = "/admin/kanban"; }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-foreground/5 transition-colors text-left group"
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${statusBg[t.status] || 'bg-slate-100 text-slate-500'}`}>
                            <Icon icon={statusIcons[t.status] || "lucide:ticket"} className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{t.title}</div>
                            <div className="text-xs text-foreground/40 truncate">
                              <span className="font-mono">{t.id?.slice(0, 8)}</span> · {t.createdByName} · {t.category}
                            </div>
                          </div>
                          <Icon icon="lucide:arrow-right" className="w-4 h-4 text-foreground/20 group-hover:text-foreground/50 shrink-0" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-foreground/40 text-sm">
                      <Icon icon="lucide:search-x" className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                      No se encontraron resultados para &ldquo;{searchQuery}&rdquo;
                    </div>
                  )
                ) : (
                  <div className="px-2 py-4">
                    <p className="text-xs font-semibold text-foreground/40 mb-2 px-2 uppercase tracking-wider">Accesos rápidos</p>
                    <button onClick={() => { setCmdKOpen(false); window.location.href = "/admin/kanban"; }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-foreground/5 transition-colors text-left group">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                        <Icon icon="lucide:kanban-square" className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">Tablero Kanban</div>
                        <div className="text-xs text-foreground/40">Gestionar solicitudes</div>
                      </div>
                    </button>
                    <button onClick={() => { setCmdKOpen(false); window.location.href = "/admin/metrics"; }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-foreground/5 transition-colors text-left group mt-1">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <Icon icon="lucide:bar-chart-3" className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">Métricas y KPIs</div>
                        <div className="text-xs text-foreground/40">Reportes en tiempo real</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
