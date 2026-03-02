import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const newsletters = await prisma.newsletter.findMany({
      orderBy: { createdAt: "desc" },
    });

    const subscriberCount = await prisma.newsletterSubscriber.count({
      where: { isActive: true },
    });

    return NextResponse.json({ newsletters, subscriberCount });
  } catch (error) {
    console.error("Erro ao listar newsletters:", error);
    return NextResponse.json(
      { error: "Erro ao listar newsletters" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, isPremium } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Campos obrigatórios: title, content" },
        { status: 400 }
      );
    }

    const newsletter = await prisma.newsletter.create({
      data: {
        title,
        content,
        isPremium: isPremium || false,
      },
    });

    return NextResponse.json(newsletter, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar newsletter:", error);
    return NextResponse.json(
      { error: "Erro ao criar newsletter" },
      { status: 500 }
    );
  }
}
