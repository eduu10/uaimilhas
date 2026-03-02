import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
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

    const clicksAggregate = await prisma.affiliateClick.aggregate({
      _count: true,
    });

    const conversions = await prisma.affiliateClick.aggregate({
      where: { converted: true },
      _count: true,
      _sum: { revenue: true },
    });

    const earningsAggregate = await prisma.affiliateEarning.aggregate({
      _sum: { amount: true },
      _count: true,
    });

    const earningsByStatus = await prisma.affiliateEarning.groupBy({
      by: ["status"],
      _sum: { amount: true },
      _count: true,
    });

    const earningsBreakdown: Record<string, { count: number; total: number }> = {};
    for (const group of earningsByStatus) {
      earningsBreakdown[group.status] = {
        count: group._count,
        total: group._sum.amount || 0,
      };
    }

    return NextResponse.json({
      links,
      stats: {
        totalLinks: links.length,
        activeLinks: links.filter((l) => l.isActive).length,
        totalClicks: clicksAggregate._count,
        totalConversions: conversions._count,
        totalConversionRevenue: conversions._sum.revenue || 0,
        totalEarnings: earningsAggregate._sum.amount || 0,
        totalEarningRecords: earningsAggregate._count,
        earningsByStatus: earningsBreakdown,
      },
    });
  } catch (error) {
    console.error("Erro ao listar afiliados (admin):", error);
    return NextResponse.json(
      { error: "Erro ao listar afiliados" },
      { status: 500 }
    );
  }
}
