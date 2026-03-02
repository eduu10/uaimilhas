import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const { email } = body;

  if (!email) {
    return NextResponse.json(
      { error: "Email é obrigatório" },
      { status: 400 }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { error: "Email inválido" },
      { status: 400 }
    );
  }

  const existing = await prisma.newsletterSubscriber.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existing) {
    if (existing.isActive) {
      return NextResponse.json(
        { message: "Este email já está inscrito na newsletter" },
        { status: 200 }
      );
    }

    const reactivated = await prisma.newsletterSubscriber.update({
      where: { email: email.toLowerCase() },
      data: { isActive: true },
    });

    return NextResponse.json({
      message: "Inscrição reativada com sucesso!",
      subscriber: reactivated,
    });
  }

  const subscriber = await prisma.newsletterSubscriber.create({
    data: {
      email: email.toLowerCase(),
    },
  });

  return NextResponse.json(
    {
      message: "Inscrito na newsletter com sucesso!",
      subscriber,
    },
    { status: 201 }
  );
}
