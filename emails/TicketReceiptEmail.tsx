import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,

  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

interface TicketReceiptEmailProps {
  estudianteNombre: string;
  ticketId: string;
  categoria: string;
}

export const TicketReceiptEmail = ({
  estudianteNombre = "Estudiante",
  ticketId = "TKT-0000",
  categoria = "General",
}: TicketReceiptEmailProps) => {
  const previewText = `Confirmación de solicitud: ${ticketId}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-slate-50 my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px] bg-white shadow-sm">
            <Section className="mt-[32px]">
              <Heading className="text-indigo-600 text-[14px] font-bold p-0 my-[10px] mx-0 uppercase tracking-widest text-center">
                Sede Viña del Mar - Hub Consejeros
              </Heading>
            </Section>
            
            <Heading className="text-slate-800 text-[24px] font-extrabold text-center p-0 my-[30px] mx-0">
              Solicitud Recibida
            </Heading>
            
            <Text className="text-slate-600 text-[14px] leading-[24px]">
              Hola <strong>{estudianteNombre}</strong>,
            </Text>
            
            <Text className="text-slate-600 text-[14px] leading-[24px]">
              Hemos recibido tu solicitud correctamente. Tus **Consejeros de Carrera** ya han sido notificados y comenzarán la gestión de tu caso.
            </Text>

            <Section className="bg-slate-50 rounded-lg p-4 my-6 border border-slate-100">
              <Text className="text-[12px] font-bold text-slate-400 uppercase m-0 mb-2">Detalles del Ticket</Text>
              <Text className="text-slate-700 text-[14px] m-0"><strong>ID:</strong> {ticketId}</Text>
              <Text className="text-slate-700 text-[14px] m-0"><strong>Categoría:</strong> {categoria}</Text>
            </Section>

            <Text className="text-slate-500 text-[13px] leading-[22px] italic">
              * El tiempo estimado de primera respuesta (SLA) es de 2 días hábiles.
            </Text>

            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-indigo-600 rounded-xl text-white text-[12px] font-bold no-underline text-center px-6 py-4 shadow-lg shadow-indigo-200"
                href="https://consejeros.vercel.app/perfil"
              >
                Ver estado de mi solicitud
              </Button>
            </Section>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            
            <Text className="text-[#666666] text-[12px] leading-[24px] text-center">
              Hub Consejeros Duoc UC · Sede Viña del Mar <br />
              Este es un correo transaccional automático.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default TicketReceiptEmail;
