"use client";

import React, { useRef, useEffect, useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { categoryLabels, TicketCategory, urgencyLabels, Ticket } from "@/lib/data";
import { Icon } from "@iconify/react";

// ---- Canvas Bar Chart ----
function BarChart({ data, height = 260 }: {
  data: { label: string; value: number; color: string }[];
  height?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) setWidth(entries[0].contentRect.width);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.clearRect(0, 0, width, height);

    const max = Math.max(...data.map((d) => d.value), 1);
    const barWidth = Math.min(50, (width - 60) / data.length - 12);
    const chartBottom = height - 40;
    const chartTop = 20;
    const chartHeight = chartBottom - chartTop;

    // Grid lines
    ctx.strokeStyle = "rgba(0,0,0,0.04)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = chartTop + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(width - 10, y);
      ctx.stroke();

      // Y-axis labels
      ctx.fillStyle = "rgba(15, 23, 42, 0.3)";
      ctx.font = "10px system-ui";
      ctx.textAlign = "right";
      ctx.fillText(Math.round(max - (max / 4) * i).toString(), 35, y + 4);
    }

    // Bars
    const totalBarSpace = data.length * (barWidth + 12);
    const startX = (width - totalBarSpace) / 2 + 6;

    data.forEach((d, i) => {
      const x = startX + i * (barWidth + 12);
      const barHeight = (d.value / max) * chartHeight;
      const y = chartBottom - barHeight;

      // Bar shadow
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.beginPath();
      // @ts-ignore
      ctx.roundRect(x + 2, y + 2, barWidth, barHeight, [6, 6, 0, 0]);
      ctx.fill();

      // Bar
      const gradient = ctx.createLinearGradient(x, y, x, chartBottom);
      gradient.addColorStop(0, d.color);
      gradient.addColorStop(1, d.color + "66");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      // @ts-ignore
      ctx.roundRect(x, y, barWidth, barHeight, [6, 6, 0, 0]);
      ctx.fill();

      // Value on top
      ctx.fillStyle = "rgba(15, 23, 42, 0.6)";
      ctx.font = "bold 11px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(d.value.toString(), x + barWidth / 2, y - 6);

      // Label
      ctx.fillStyle = "rgba(15, 23, 42, 0.4)";
      ctx.font = "9px system-ui";
      const labelText = (d.label || "N/A").toString();
      ctx.fillText(labelText.slice(0, 8), x + barWidth / 2, chartBottom + 16);
    });
  }, [data, width, height]);

  return (
    <div ref={containerRef} className="w-full">
      <canvas ref={canvasRef} className="block" />
    </div>
  );
}

// ---- Canvas Donut Chart ----
function DonutChart({ data, size = 200 }: {
  data: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const [currentSize, setCurrentSize] = useState(size);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        const newSize = Math.min(size, entries[0].contentRect.width);
        setCurrentSize(newSize);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [size]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = currentSize * dpr;
    canvas.height = currentSize * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${currentSize}px`;
    canvas.style.height = `${currentSize}px`;

    ctx.clearRect(0, 0, currentSize, currentSize);
    const cx = currentSize / 2;
    const cy = currentSize / 2;
    const radius = currentSize / 2 - 10;
    const innerRadius = radius * 0.6;

    let startAngle = -Math.PI / 2;

    data.forEach((d) => {
      const sweep = (d.value / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, startAngle + sweep);
      ctx.arc(cx, cy, innerRadius, startAngle + sweep, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = d.color;
      ctx.fill();
      startAngle += sweep;
    });

    // Center text
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.font = "bold 24px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(total.toString(), cx, cy + 4);
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.font = "10px system-ui";
    ctx.fillText("total", cx, cy + 18);
  }, [data, currentSize, total]);

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-4 w-full">
      <canvas ref={canvasRef} />
      <div className="flex flex-wrap gap-3 justify-center">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-1.5 text-xs text-foreground">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
            {d.label} ({d.value})
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Trend Line Chart ----
function TrendLine({ data, height = 180, color = "#5483BF" }: {
  data: number[];
  height?: number; color?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) setWidth(entries[0].contentRect.width);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.clearRect(0, 0, width, height);

    if (data.length < 2) return;

    const max = Math.max(...data) * 1.2 || 1;
    const stepX = (width - 60) / (data.length - 1);
    const chartBottom = height - 30;
    const chartTop = 10;
    const chartHeight = chartBottom - chartTop;

    // Grid
    ctx.strokeStyle = "rgba(0,0,0,0.04)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 3; i++) {
      const y = chartTop + (chartHeight / 3) * i;
      ctx.beginPath();
      ctx.moveTo(30, y);
      ctx.lineTo(width - 10, y);
      ctx.stroke();
    }

    // Area fill
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = 30 + i * stepX;
      const y = chartBottom - (v / max) * chartHeight;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(30 + (data.length - 1) * stepX, chartBottom);
    ctx.lineTo(30, chartBottom);
    ctx.closePath();
    const gradient = ctx.createLinearGradient(0, chartTop, 0, chartBottom);
    gradient.addColorStop(0, color + "30");
    gradient.addColorStop(1, color + "05");
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = 30 + i * stepX;
      const y = chartBottom - (v / max) * chartHeight;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.stroke();

    // Dots
    data.forEach((v, i) => {
      const x = 30 + i * stepX;
      const y = chartBottom - (v / max) * chartHeight;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
    });

    // X labels
    const labels = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
    data.forEach((_, i) => {
      const x = 30 + i * stepX;
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.font = "9px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(labels[i % 7], x, chartBottom + 16);
    });
  }, [data, width, height, color]);

  return (
    <div ref={containerRef} className="w-full">
      <canvas ref={canvasRef} className="block" />
    </div>
  );
}

// ---- KPI Card ----
function KPICard({ icon, label, value, subtitle, target, color }: {
  icon: string; label: string; value: string; subtitle?: string; target?: string; color?: string;
}) {
  return (
    <div className="rounded-2xl bg-surface-card border border-border p-5 hover:border-foreground transition-all">
      <div className="flex items-center gap-3 mb-3 text-indigo-600">
        <span className="text-xl"><Icon icon={icon} /></span>
        <span className="text-sm text-foreground font-medium">{label}</span>
      </div>
      <div className={`text-3xl font-bold ${color || "text-foreground"}`}>{value}</div>
      {subtitle && <p className="text-xs text-foreground mt-1">{subtitle}</p>}
      {target && (
        <div className="mt-2 text-[10px] text-foreground flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-status-success" />
          Objetivo: {target}
        </div>
      )}
    </div>
  );
}

// ---- Main Page ----
export default function MetricsPage() {
  const { tickets, surveys } = useApp();

  const resolved = tickets.filter((t) => t.status === "resuelto");
  const totalTickets = tickets.length;

  // Average resolution time (mock: random 4-72h for resolved tickets)
  const avgResolutionHours = useMemo(() => {
    if (resolved.length === 0) return 0;
    const totalHours = resolved.reduce((sum, t) => {
      const created = new Date(t.createdAt).getTime();
      const updated = new Date(t.updatedAt).getTime();
      return sum + (updated - created) / 3600000;
    }, 0);
    return Math.round(totalHours / resolved.length);
  }, [resolved]);

  // FCR (mock: ~75%)
  const fcrRate = resolved.length > 0 ? Math.round((resolved.length * 0.75 / Math.max(resolved.length, 1)) * 100) : 0;

  // CSAT / CES
  const avgCSAT = surveys.length > 0 ? (surveys.reduce((s, sv) => s + sv.csat, 0) / surveys.length) : 0;
  const avgCES = surveys.length > 0 ? (surveys.reduce((s, sv) => s + sv.ces, 0) / surveys.length) : 0;

  // Category bar chart data
  const catData = useMemo(() => {
    const counts: Record<string, number> = {};
    tickets.forEach((t) => { counts[t.category] = (counts[t.category] || 0) + 1; });
    const colors: Record<string, string> = {
      academico: "#5483BF", infraestructura: "#F2A81D", bienestar: "#A680BF", financiero: "#B7D984", otro: "#6B7280",
    };
    return Object.entries(counts).map(([cat, val]) => ({
      label: categoryLabels[cat as TicketCategory] || cat || "Otro",
      value: val,
      color: colors[cat] || "#6B7280",
    }));
  }, [tickets]);

  // CSAT distribution donut
  const csatDistribution = useMemo(() => {
    const dist = [0, 0, 0, 0, 0]; // 1-5 stars
    surveys.forEach((s) => { dist[s.csat - 1]++; });
    return [
      { label: "1★", value: dist[0], color: "#F24B4B" },
      { label: "2★", value: dist[1], color: "#F2A81D" },
      { label: "3★", value: dist[2], color: "#F2A81D" },
      { label: "4★", value: dist[3], color: "#B7D984" },
      { label: "5★", value: dist[4], color: "#5483BF" },
    ].filter((d) => d.value > 0);
  }, [surveys]);

  // Weekly trend (mock)
  const weeklyTrend = [3, 5, 2, 7, 4, 1, 6];
  const csatTrend = [3.8, 4.0, 3.5, 4.2, 4.5, 4.1, 4.3];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Métricas y KPIs</h1>
        <p className="text-foreground text-sm mt-1">Eficiencia operativa y satisfacción estudiantil</p>
      </div>

      {/* ---- Eficiencia Operativa ---- */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-indigo-600" />
          Eficiencia Operativa
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard icon="lucide:mail" label="Volumen Total" value={totalTickets.toString()} subtitle="Tickets registrados" />
          <KPICard
            icon="lucide:timer" label="Tiempo Promedio Resolución"
            value={`${avgResolutionHours}h`}
            subtitle="Horas promedio"
            color={avgResolutionHours < 24 ? "text-status-success" : "text-status-warning"}
          />
          <KPICard
            icon="lucide:target" label="FCR Rate"
            value={`${fcrRate}%`}
            subtitle="Resolución en primer contacto"
            target="70-80%"
            color={fcrRate >= 70 ? "text-status-success" : "text-status-warning"}
          />
          <KPICard icon="lucide:check-circle-2" label="Tasa Resolución" value={totalTickets > 0 ? `${Math.round((resolved.length / totalTickets) * 100)}%` : "—"} subtitle="Tickets resueltos" />
        </div>
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-surface-card border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2"><Icon icon="lucide:bar-chart-2" className="text-indigo-600" /> Tickets por Categoría</h3>
          <BarChart data={catData} height={240} />
        </div>
        <div className="rounded-2xl bg-surface-card border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2"><Icon icon="lucide:line-chart" className="text-indigo-600" /> Tendencia Semanal</h3>
          <TrendLine data={weeklyTrend} height={200} color="#5483BF" />
        </div>
      </div>

      {/* ---- Efectividad y Satisfacción ---- */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-indigo-500" />
          Efectividad y Satisfacción
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <KPICard
            icon="lucide:smile" label="CSAT Score"
            value={avgCSAT > 0 ? avgCSAT.toFixed(1) : "—"}
            subtitle="Satisfacción del estudiante (1-5)"
            color={avgCSAT >= 4 ? "text-status-success" : avgCSAT >= 3 ? "text-status-warning" : "text-status-danger"}
          />
          <KPICard
            icon="lucide:activity" label="CES Score"
            value={avgCES > 0 ? avgCES.toFixed(1) : "—"}
            subtitle="Esfuerzo del estudiante (1=fácil, 7=difícil)"
            color={avgCES <= 3 ? "text-status-success" : avgCES <= 5 ? "text-status-warning" : "text-status-danger"}
          />
          <KPICard
            icon="lucide:clipboard-list" label="Encuestas Completadas"
            value={surveys.length.toString()}
            subtitle="Respuestas recibidas"
          />
        </div>
      </div>

      {/* CSAT Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-surface-card border border-border p-5 flex flex-col items-center">
          <h3 className="text-sm font-semibold text-foreground mb-4 self-start flex items-center gap-2"><Icon icon="lucide:star" className="text-status-warning" /> Distribución CSAT</h3>
          {csatDistribution.length > 0 ? (
            <DonutChart data={csatDistribution} />
          ) : (
            <div className="text-foreground text-sm py-8">Sin datos de encuestas</div>
          )}
        </div>
        <div className="rounded-2xl bg-surface-card border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2"><Icon icon="lucide:trending-down" className="text-indigo-500" /> Tendencia CSAT</h3>
          <TrendLine data={csatTrend} height={200} color="#A680BF" />
        </div>
      </div>
    </div>
  );
}
