"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import LoginForm from "@/components/LoginForm";
import TicketForm from "@/components/TicketForm";

export default function HomePage() {
  const { user, isInitializing, isAuthLoading } = useApp();


  if (isInitializing || isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return <TicketForm />;
}
