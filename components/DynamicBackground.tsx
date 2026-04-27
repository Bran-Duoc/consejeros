"use client";

import React, { useEffect, useState } from "react";

const COLORS = [
  "#307fe2", // Blue
  "#ac4fc6", // Purple
  "#c4d600", // Lime
  "#d50032", // Red
  "#5bc2e7", // Sky
  "#f8b31c", // Orange
  "#ffffff", // White
  "#000000", // Black
];

export default function DynamicBackground() {
  const [blobs, setBlobs] = useState<any[]>([]);

  useEffect(() => {
    // Generate one blob for EACH color to ensure all are present and independent
    const initialBlobs = COLORS.map((color, i) => ({
      id: i,
      color: color,
      width: Math.random() * 30 + 30 + "%",
      height: Math.random() * 30 + 30 + "%",
      top: Math.random() * 80 + 10 + "%",
      left: Math.random() * 80 + 10 + "%",
      duration: Math.random() * 10 + 15 + "s", 
      delay: Math.random() * -20 + "s",
      // Random movement vectors
      tx: (Math.random() - 0.5) * 80 + "vw",
      ty: (Math.random() - 0.5) * 80 + "vh",
      tx2: (Math.random() - 0.5) * 80 + "vw",
      ty2: (Math.random() - 0.5) * 80 + "vh",
    }));
    setBlobs(initialBlobs);
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-white">
      <div className="absolute inset-0">
        {blobs.map((blob) => (
          <div
            key={blob.id}
            className="absolute rounded-full opacity-30 mix-blend-multiply filter blur-[80px] animate-blob-random"
            style={{
              backgroundColor: blob.color,
              width: blob.width,
              height: blob.height,
              top: blob.top,
              left: blob.left,
              animationDuration: blob.duration,
              animationDelay: blob.delay,
              // @ts-ignore
              "--tx": blob.tx,
              "--ty": blob.ty,
              "--tx2": blob.tx2,
              "--ty2": blob.ty2,
            }}
          />
        ))}
      </div>

      {/* Glassmorphism Overlay */}
      <div className="absolute inset-0 backdrop-blur-[100px] bg-white/10" />
      
      {/* Noise Texture */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
