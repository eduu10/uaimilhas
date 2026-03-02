import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const earnings = await prisma.affiliateEarning.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(earnings);
  } catch (error) {
    console.error("Erro ao listar ganhos de afiliados:", error);
    return NextResponse.json(
      { error: "Erro ao listar ganhos de afiliados" },
      { status: 500 }
    );
  }
}
