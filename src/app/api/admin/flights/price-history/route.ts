import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const origin = searchParams.get("origin");
    const destination = searchParams.get("destination");

    const where: any = {};
    if (origin) where.origin = origin;
    if (destination) where.destination = destination;

    const priceHistory = await prisma.priceHistory.findMany({
      where,
      orderBy: { recordedAt: "desc" },
      take: 100,
    });

    return NextResponse.json(priceHistory);
  } catch (error) {
    console.error("Erro ao buscar histórico de preços:", error);
    return NextResponse.json(
      { error: "Erro ao buscar histórico de preços" },
      { status: 500 }
    );
  }
}
