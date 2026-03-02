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
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const existing = await prisma.affiliateLink.findUnique({
      where: { id: params.linkId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Link de afiliado não encontrado" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const updateData: any = {};

    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const link = await prisma.affiliateLink.update({
      where: { id: params.linkId },
      data: updateData,
    });

    return NextResponse.json(link);
  } catch (error) {
    console.error("Erro ao atualizar link de afiliado:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar link de afiliado" },
      { status: 500 }
    );
  }
}
