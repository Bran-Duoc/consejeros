"use client";

import React from "react";

// ---- Base Skeleton ----
function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-200/70 ${className}`}
      aria-hidden="true"
    />
  );
}

// ---- Stat Card Skeleton ----
export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <Skeleton className="w-12 h-5 rounded-full" />
      </div>
      <Skeleton className="w-16 h-9 mb-1" />
      <Skeleton className="w-24 h-4" />
    </div>
  );
}

// ---- Ticket Card Skeleton ----
export function TicketCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 animate-fade-in">
      <div className="flex items-start gap-4">
        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="w-16 h-5 rounded-full" />
            <Skeleton className="w-10 h-4 rounded" />
          </div>
          <Skeleton className="w-3/4 h-5" />
          <div className="flex items-center gap-3">
            <Skeleton className="w-24 h-4" />
            <Skeleton className="w-20 h-4" />
          </div>
        </div>
        <Skeleton className="w-5 h-5 rounded shrink-0" />
      </div>
    </div>
  );
}

// ---- Kanban Column Skeleton ----
export function KanbanColumnSkeleton() {
  return (
    <div className="flex flex-col w-full bg-slate-50 rounded-2xl border border-slate-200">
      <div className="rounded-t-2xl bg-slate-100/80 px-4 py-3 flex items-center gap-3">
        <Skeleton className="w-1.5 h-6 rounded-full" />
        <Skeleton className="w-20 h-5" />
        <Skeleton className="w-6 h-4 rounded" />
      </div>
      <div className="p-3 space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="w-24 h-4" />
              <Skeleton className="w-12 h-4 rounded" />
            </div>
            <Skeleton className="w-full h-5" />
            <Skeleton className="w-2/3 h-4" />
            <div className="flex items-center gap-2">
              <Skeleton className="flex-1 h-1.5 rounded-full" />
              <Skeleton className="w-16 h-3" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Skeleton className="w-5 h-5 rounded-md" />
                <Skeleton className="w-12 h-3" />
              </div>
              <Skeleton className="w-14 h-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Profile Info Skeleton ----
export function ProfileInfoSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="w-16 h-3" />
            <Skeleton className="w-28 h-5" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---- Tickets List Skeleton ----
export function TicketsListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <TicketCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default Skeleton;
