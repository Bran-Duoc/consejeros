import { Resend } from "resend";
import { TicketReceiptEmail } from "@/emails/TicketReceiptEmail";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { estudianteNombre, estudianteEmail, categoria, ticketId } = await req.json();

    // Validar datos mínimos
    if (!estudianteNombre || !ticketId) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios (nombre o ID)" },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      // Sandbox: El 'from' DEBE ser onboarding@resend.dev
      from: "Hub Consejeros Viña <onboarding@resend.dev>",
      
      // Sandbox: El 'to' DEBE ser el correo verificado del admin
      // Nota: En producción, aquí iría [estudianteEmail]
      to: ["bran.pizarro@duocuc.cl"],
      
      subject: `Ticket Recibido: ${categoria} - Sede Viña del Mar`,
      react: TicketReceiptEmail({
        estudianteNombre,
        ticketId,
        categoria,
      }),
    });

    if (error) {
      console.error("Resend Error:", error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ message: "Correo enviado con éxito", id: data?.id });
  } catch (err) {
    console.error("API Route Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
