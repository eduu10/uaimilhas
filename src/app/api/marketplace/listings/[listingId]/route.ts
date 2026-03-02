import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { listingId: string } }
) {
  try {
    const listing = await prisma.milesListing.findUnique({
      where: { id: params.listingId },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            image: true,
            tier: true,
            createdAt: true,
          },
        },
        transactions: {
          select: {
            id: true,
            amount: true,
            totalPrice: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Anúncio não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(listing);
  } catch (error) {
    console.error("Erro ao buscar anúncio:", error);
    return NextResponse.json(
      { error: "Erro ao buscar anúncio" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { listingId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const listing = await prisma.milesListing.findUnique({
      where: { id: params.listingId },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Anúncio não encontrado" },
        { status: 404 }
      );
    }

    if (listing.sellerId !== session.user.id) {
      return NextResponse.json(
        { error: "Você não tem permissão para editar este anúncio" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { pricePerThousand, minPurchase, status } = body;

    const updateData: any = {};

    if (pricePerThousand !== undefined) {
      updateData.pricePerThousand = pricePerThousand;
      updateData.totalPrice = (listing.amount / 1000) * pricePerThousand;
    }

    if (minPurchase !== undefined) {
      updateData.minPurchase = minPurchase;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    const updated = await prisma.milesListing.update({
      where: { id: params.listingId },
      data: updateData,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar anúncio:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar anúncio" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { listingId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const listing = await prisma.milesListing.findUnique({
      where: { id: params.listingId },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Anúncio não encontrado" },
        { status: 404 }
      );
    }

    if (listing.sellerId !== session.user.id) {
      return NextResponse.json(
        { error: "Você não tem permissão para cancelar este anúncio" },
        { status: 403 }
      );
    }

    const cancelled = await prisma.milesListing.update({
      where: { id: params.listingId },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({ message: "Anúncio cancelado", listing: cancelled });
  } catch (error) {
    console.error("Erro ao cancelar anúncio:", error);
    return NextResponse.json(
      { error: "Erro ao cancelar anúncio" },
      { status: 500 }
    );
  }
}
