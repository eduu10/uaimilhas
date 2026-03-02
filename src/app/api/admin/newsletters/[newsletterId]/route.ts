import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { newsletterId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
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

    const body = await req.json();
    const { title, content, isPremium, sentAt } = body;

    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (isPremium !== undefined) updateData.isPremium = isPremium;
    if (sentAt !== undefined) updateData.sentAt = new Date(sentAt);

    const newsletter = await prisma.newsletter.update({
      where: { id: params.newsletterId },
      data: updateData,
    });

    return NextResponse.json(newsletter);
  } catch (error) {
    console.error("Erro ao atualizar newsletter:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar newsletter" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { newsletterId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
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

    await prisma.newsletter.delete({
      where: { id: params.newsletterId },
    });

    return NextResponse.json({ message: "Newsletter excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir newsletter:", error);
    return NextResponse.json(
      { error: "Erro ao excluir newsletter" },
      { status: 500 }
    );
  }
}
