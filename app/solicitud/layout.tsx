import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nueva Solicitud | Sede Viña del Mar",
  description: "Ingresa una nueva solicitud de apoyo académico, infraestructura, bienestar o financiero.",
};

export default function SolicitudLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
