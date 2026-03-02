import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { listingId, amount } = await req.json();

    if (!listingId || !amount) {
      return NextResponse.json(
        { error: "Campos obrigatórios: listingId, amount" },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "A quantidade deve ser maior que zero" },
        { status: 400 }
      );
    }

    const listing = await prisma.milesListing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Anúncio não encontrado" },
        { status: 404 }
      );
    }

    if (listing.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Este anúncio não está mais ativo" },
        { status: 400 }
      );
    }

    if (listing.sellerId === session.user.id) {
      return NextResponse.json(
        { error: "Você não pode comprar suas próprias milhas" },
        { status: 400 }
      );
    }

    if (amount < listing.minPurchase) {
      return NextResponse.json(
        { error: `A compra mínima é de ${listing.minPurchase} milhas` },
        { status: 400 }
      );
    }

    if (amount > listing.amount) {
      return NextResponse.json(
        { error: `Quantidade disponível: ${listing.amount} milhas` },
        { status: 400 }
      );
    }

    const totalPrice = (amount / 1000) * listing.pricePerThousand;
    const platformFee = totalPrice * 0.05;
    const sellerPayout = totalPrice * 0.95;

    const remainingAmount = listing.amount - amount;
    const isFullPurchase = remainingAmount === 0;

    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.milesTransaction.create({
        data: {
          listingId: listing.id,
          buyerId: session.user.id,
          sellerId: listing.sellerId,
          amount,
          totalPrice,
          platformFee,
          sellerPayout,
          status: "pending",
        },
      });

      if (isFullPurchase) {
        await tx.milesListing.update({
          where: { id: listing.id },
          data: {
            amount: 0,
            status: "SOLD",
          },
        });
      } else {
        await tx.milesListing.update({
          where: { id: listing.id },
          data: {
            amount: remainingAmount,
            totalPrice: (remainingAmount / 1000) * listing.pricePerThousand,
          },
        });
      }

      return transaction;
    });

    return NextResponse.json({
      success: true,
      message: "Compra realizada com sucesso!",
      transaction: result,
    });
  } catch (error) {
    console.error("Erro ao comprar milhas:", error);
    return NextResponse.json(
      { error: "Erro ao processar compra" },
      { status: 500 }
    );
  }
}
