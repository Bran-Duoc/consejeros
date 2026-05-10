"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import LoginForm from "@/components/LoginForm";
import TicketForm from "@/components/TicketForm";

export default function HomePage() {
  const { user } = useApp();

  if (!user) {
    return <LoginForm />;
  }

  return <TicketForm />;
}

