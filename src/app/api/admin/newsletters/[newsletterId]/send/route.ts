import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { newsletterId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const existing = await prisma.newsletter.findUnique({
      where: { id: params.newsletterId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Newsletter não encontrada" },
        { status: 404 }
      );
    }

    if (existing.sentAt) {
      return NextResponse.json(
        { error: "Newsletter já foi enviada" },
        { status: 400 }
      );
    }

    const newsletter = await prisma.newsletter.update({
      where: { id: params.newsletterId },
      data: { sentAt: new Date() },
    });

    return NextResponse.json(newsletter);
  } catch (error) {
    console.error("Erro ao enviar newsletter:", error);
    return NextResponse.json(
      { error: "Erro ao enviar newsletter" },
      { status: 500 }
    );
  }
}
