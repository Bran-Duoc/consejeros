"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Define a type-safe Formbricks interface
interface FormbricksSDK {
  init: (config: { environmentId: string; apiHost: string }) => Promise<void>;
  registerRouteChange: () => void;
}

declare global {
  interface Window {
    formbricks?: FormbricksSDK;
  }
}

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
        if (window.formbricks) {
          window.formbricks.init({
            environmentId: FORMBRICKS_ENVIRONMENT_ID,
            apiHost: FORMBRICKS_HOST,
          }).then(() => {
            isInitialized.current = true;
            // Registrar la ruta inicial una vez inicializado
            window.formbricks?.registerRouteChange();
          }).catch(console.error);
        }
      };
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    // Solo registrar cambios de ruta posteriores si ya está inicializado
    if (isInitialized.current && window.formbricks && typeof window.formbricks.registerRouteChange === 'function') {
      window.formbricks.registerRouteChange();
    }
  }, [pathname]);

  return null;
}
