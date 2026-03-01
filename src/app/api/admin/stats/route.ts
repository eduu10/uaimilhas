import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const [totalUsers, totalPointsTx, totalRedeems] = await Promise.all([
      prisma.user.count({ where: { role: "CLIENTE" } }),
      prisma.pointTransaction.aggregate({ _sum: { amount: true }, where: { amount: { gt: 0 } } }),
      prisma.order.count(),
    ]);

    return NextResponse.json({
      totalUsers,
      totalPoints: totalPointsTx._sum.amount || 0,
      totalRedeems,
      monthlyRevenue: 0,
    });
  } catch {
    return NextResponse.json({
      totalUsers: 0, totalPoints: 0, totalRedeems: 0, monthlyRevenue: 0,
    });
  }
}
