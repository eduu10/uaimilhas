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

    const totalListings = listings.length;
    const activeListings = listings.filter((l) => l.status === "ACTIVE").length;
    const soldListings = listings.filter((l) => l.status === "SOLD").length;
    const cancelledListings = listings.filter((l) => l.status === "CANCELLED").length;

    const transactions = await prisma.milesTransaction.aggregate({
      _sum: {
        totalPrice: true,
        platformFee: true,
        sellerPayout: true,
      },
      _count: true,
    });

    return NextResponse.json({
      listings,
      stats: {
        totalListings,
        activeListings,
        soldListings,
        cancelledListings,
        totalTransactions: transactions._count,
        totalRevenue: transactions._sum.totalPrice || 0,
        totalPlatformFees: transactions._sum.platformFee || 0,
        totalSellerPayouts: transactions._sum.sellerPayout || 0,
      },
    });
  } catch (error) {
    console.error("Erro ao listar marketplace (admin):", error);
    return NextResponse.json(
      { error: "Erro ao listar marketplace" },
      { status: 500 }
    );
  }
}
