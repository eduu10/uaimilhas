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
      totalListings,
      activeListings,
      soldListings,
      cancelledListings,
      transactionsAggregate,
    ] = await Promise.all([
      prisma.milesListing.count(),
      prisma.milesListing.count({ where: { status: "ACTIVE" } }),
      prisma.milesListing.count({ where: { status: "SOLD" } }),
      prisma.milesListing.count({ where: { status: "CANCELLED" } }),
      prisma.milesTransaction.aggregate({
        _count: true,
        _sum: {
          totalPrice: true,
          platformFee: true,
          sellerPayout: true,
        },
      }),
    ]);

    return NextResponse.json({
      totalListings,
      activeListings,
      soldListings,
      cancelledListings,
      totalTransactions: transactionsAggregate._count,
      totalRevenue: transactionsAggregate._sum.totalPrice || 0,
      totalPlatformFees: transactionsAggregate._sum.platformFee || 0,
      totalSellerPayouts: transactionsAggregate._sum.sellerPayout || 0,
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas do marketplace:", error);
    return NextResponse.json(
      { error: "Erro ao buscar estatísticas do marketplace" },
      { status: 500 }
    );
  }
}
