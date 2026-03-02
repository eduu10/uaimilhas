import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { linkId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const link = await prisma.affiliateLink.findUnique({
      where: { id: params.linkId },
    });

    if (!link) {
      return NextResponse.json(
        { error: "Link não encontrado" },
        { status: 404 }
      );
    }

    if (link.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Você não tem permissão para editar este link" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, url, commission, category, isActive } = body;

    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (url !== undefined) updateData.url = url;
    if (commission !== undefined) updateData.commission = commission;
    if (category !== undefined) updateData.category = category;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updated = await prisma.affiliateLink.update({
      where: { id: params.linkId },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar link de afiliado:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar link de afiliado" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { linkId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const link = await prisma.affiliateLink.findUnique({
      where: { id: params.linkId },
    });

    if (!link) {
      return NextResponse.json(
        { error: "Link não encontrado" },
        { status: 404 }
      );
    }

    if (link.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Você não tem permissão para excluir este link" },
        { status: 403 }
      );
    }

    await prisma.affiliateLink.delete({
      where: { id: params.linkId },
    });

    return NextResponse.json({ message: "Link excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir link de afiliado:", error);
    return NextResponse.json(
      { error: "Erro ao excluir link de afiliado" },
      { status: 500 }
    );
  }
}
