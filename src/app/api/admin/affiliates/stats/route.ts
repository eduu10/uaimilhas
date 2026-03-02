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

    const [
      totalLinks,
      activeLinks,
      totalClicks,
      totalConversions,
      earningsAggregate,
      pendingEarnings,
    ] = await Promise.all([
      prisma.affiliateLink.count(),
      prisma.affiliateLink.count({ where: { isActive: true } }),
      prisma.affiliateClick.count(),
      prisma.affiliateClick.count({ where: { converted: true } }),
      prisma.affiliateEarning.aggregate({
        _sum: { amount: true },
      }),
      prisma.affiliateEarning.aggregate({
        where: { status: "pending" },
        _sum: { amount: true },
      }),
    ]);

    return NextResponse.json({
      totalLinks,
      activeLinks,
      totalClicks,
      totalConversions,
      totalEarnings: earningsAggregate._sum.amount || 0,
      pendingEarnings: pendingEarnings._sum.amount || 0,
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas de afiliados:", error);
    return NextResponse.json(
      { error: "Erro ao buscar estatísticas de afiliados" },
      { status: 500 }
    );
  }
}
