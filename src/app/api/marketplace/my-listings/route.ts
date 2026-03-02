import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const listings = await prisma.milesListing.findMany({
      where: { sellerId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        transactions: {
          select: {
            id: true,
            buyerId: true,
            amount: true,
            totalPrice: true,
            platformFee: true,
            sellerPayout: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json(listings);
  } catch (error) {
    console.error("Erro ao listar meus anúncios:", error);
    return NextResponse.json(
      { error: "Erro ao listar meus anúncios" },
      { status: 500 }
    );
  }
}
