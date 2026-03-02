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

    const savedFlights = await prisma.savedFlight.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(savedFlights);
  } catch (error) {
    console.error("Erro ao listar voos salvos:", error);
    return NextResponse.json(
      { error: "Erro ao listar voos salvos" },
      { status: 500 }
    );
  }
}
