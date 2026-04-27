import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad | Sede Viña del Mar",
  description: "Información sobre el tratamiento de datos personales en conformidad con la Ley N° 21.719.",
};

export default function PrivacidadLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
