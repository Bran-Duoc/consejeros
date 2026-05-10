"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Reemplaza esto con tu Host y Environment ID de Formbricks
const FORMBRICKS_HOST = "https://app.formbricks.com"; 
const FORMBRICKS_ENVIRONMENT_ID = "YOUR_ENVIRONMENT_ID"; 

export default function FormbricksProvider() {
  const pathname = usePathname();
  const isInitialized = useRef(false);

  useEffect(() => {
    // Si no hay ID configurado, no cargar el script para evitar errores en consola
    if (!FORMBRICKS_ENVIRONMENT_ID || FORMBRICKS_ENVIRONMENT_ID === "YOUR_ENVIRONMENT_ID") {
      return;
    }

    if (typeof window !== "undefined" && !isInitialized.current) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@formbricks/js@latest/dist/index.umd.js";
      script.async = true;
      script.onload = () => {
        if ((window as any).formbricks) {
          (window as any).formbricks.init({
            environmentId: FORMBRICKS_ENVIRONMENT_ID,
            apiHost: FORMBRICKS_HOST,
          }).then(() => {
            isInitialized.current = true;
            // Registrar la ruta inicial una vez inicializado
            (window as any).formbricks.registerRouteChange();
          }).catch(console.error);
        }
      };
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    // Solo registrar cambios de ruta posteriores si ya está inicializado
    if (isInitialized.current && (window as any).formbricks && typeof (window as any).formbricks.registerRouteChange === 'function') {
      (window as any).formbricks.registerRouteChange();
    }
  }, [pathname]);

  return null;
}
