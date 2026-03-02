import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { earningId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const existing = await prisma.affiliateEarning.findUnique({
      where: { id: params.earningId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Ganho de afiliado não encontrado" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const updateData: any = {};

    if (body.status !== undefined) updateData.status = body.status;

    const earning = await prisma.affiliateEarning.update({
      where: { id: params.earningId },
      data: updateData,
    });

    return NextResponse.json(earning);
  } catch (error) {
    console.error("Erro ao atualizar ganho de afiliado:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar ganho de afiliado" },
      { status: 500 }
    );
  }
}
