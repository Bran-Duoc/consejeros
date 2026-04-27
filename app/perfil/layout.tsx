import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mi Perfil | Sede Viña del Mar",
  description: "Revisa el estado de tus solicitudes y gestiona tu información personal.",
};

export default function PerfilLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
