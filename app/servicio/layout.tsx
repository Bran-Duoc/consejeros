import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Condiciones del Servicio | Sede Viña del Mar",
  description: "Términos y condiciones de uso de la plataforma de solicitudes del Consejo de Sede.",
};

export default function ServicioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
