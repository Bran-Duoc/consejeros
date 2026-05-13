import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hub Consejeros — Sede Viña del Mar",
    short_name: "Consejeros",
    description: "Plataforma de gestión para Consejeros de Carrera Duoc UC.",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    dir: "ltr",
    lang: "es",
    background_color: "#ffffff",
    theme_color: "#5483BF",
    categories: ["education", "productivity"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    shortcuts: [
      {
        name: "Nueva Solicitud",
        short_name: "Solicitud",
        description: "Crear una nueva solicitud al consejo",
        url: "/?action=new",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
