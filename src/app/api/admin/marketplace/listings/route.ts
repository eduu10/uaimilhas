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

    const listings = await prisma.milesListing.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        _count: {
          select: { transactions: true },
        },
      },
    });

    return NextResponse.json(listings);
  } catch (error) {
    console.error("Erro ao listar anúncios do marketplace:", error);
    return NextResponse.json(
      { error: "Erro ao listar anúncios do marketplace" },
      { status: 500 }
    );
  }
}
