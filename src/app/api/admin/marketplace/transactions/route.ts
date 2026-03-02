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

    const transactions = await prisma.milesTransaction.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        listing: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Erro ao listar transações do marketplace:", error);
    return NextResponse.json(
      { error: "Erro ao listar transações do marketplace" },
      { status: 500 }
    );
  }
}
