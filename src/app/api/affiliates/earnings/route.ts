import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    const where: any = {
      userId: session.user.id,
    };

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    const earnings = await prisma.affiliateEarning.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const summary = {
      total: earnings.reduce((sum, e) => sum + e.amount, 0),
      pending: earnings
        .filter((e) => e.status === "pending")
        .reduce((sum, e) => sum + e.amount, 0),
      approved: earnings
        .filter((e) => e.status === "approved")
        .reduce((sum, e) => sum + e.amount, 0),
      paid: earnings
        .filter((e) => e.status === "paid")
        .reduce((sum, e) => sum + e.amount, 0),
    };

    return NextResponse.json({ earnings, summary });
  } catch (error) {
    console.error("Erro ao listar ganhos de afiliado:", error);
    return NextResponse.json(
      { error: "Erro ao listar ganhos de afiliado" },
      { status: 500 }
    );
  }
}
