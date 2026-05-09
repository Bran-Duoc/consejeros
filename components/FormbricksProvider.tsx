"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Reemplaza esto con tu Host y Environment ID de Formbricks
const FORMBRICKS_HOST = "https://app.formbricks.com"; 
const FORMBRICKS_ENVIRONMENT_ID = "YOUR_ENVIRONMENT_ID"; // El usuario deberá cambiar esto

export default function FormbricksProvider() {
  const pathname = usePathname();

  useEffect(() => {
    // Solo cargamos Formbricks en el cliente
    if (typeof window !== "undefined") {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@formbricks/js@latest/dist/index.umd.js";
      script.async = true;
      script.onload = () => {
        (window as any).formbricks.init({
          environmentId: FORMBRICKS_ENVIRONMENT_ID,
          apiHost: FORMBRICKS_HOST,
        });
      };
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    // Registramos el cambio de página para que Formbricks pueda mostrar encuestas basadas en rutas
    if (typeof window !== "undefined" && (window as any).formbricks) {
      (window as any).formbricks.registerRouteChange();
    }
  }, [pathname]);

  return null;
}
