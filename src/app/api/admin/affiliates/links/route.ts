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

    const links = await prisma.affiliateLink.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { clicks: true },
        },
      },
    });

    // Fetch earnings per userId to enrich the response
    const userIds = Array.from(new Set(links.map((l) => l.userId)));

    const earningsByUser = await prisma.affiliateEarning.groupBy({
      by: ["userId"],
      where: { userId: { in: userIds } },
      _sum: { amount: true },
    });

    const earningsMap = new Map(
      earningsByUser.map((e) => [e.userId, e._sum.amount || 0])
    );

    const result = links.map((link) => ({
      ...link,
      totalEarnings: earningsMap.get(link.userId) || 0,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao listar links de afiliados:", error);
    return NextResponse.json(
      { error: "Erro ao listar links de afiliados" },
      { status: 500 }
    );
  }
}
