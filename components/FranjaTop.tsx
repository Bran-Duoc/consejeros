"use client";

import React from "react";

export default function FranjaTop() {
  return (
    <div 
      className="w-full h-[35px] sm:h-[45px] pointer-events-none shrink-0"
      style={{
        backgroundImage: 'url("/franja2.svg")',
        backgroundRepeat: 'repeat-x',
        backgroundPosition: 'top',
        backgroundSize: 'auto 100%'
      }}
    />
  );
}
