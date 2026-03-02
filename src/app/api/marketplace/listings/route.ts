import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const program = searchParams.get("program");
    const minAmount = searchParams.get("minAmount");
    const maxPrice = searchParams.get("maxPrice");
    const sortBy = searchParams.get("sortBy") || "recent";

    const where: any = {
      status: "ACTIVE",
    };

    if (program) {
      where.program = program;
    }

    if (minAmount) {
      where.amount = { gte: parseInt(minAmount) };
    }

    if (maxPrice) {
      where.pricePerThousand = { lte: parseFloat(maxPrice) };
    }

    let orderBy: any;
    switch (sortBy) {
      case "price":
        orderBy = { pricePerThousand: "asc" };
        break;
      case "amount":
        orderBy = { amount: "desc" };
        break;
      case "recent":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    const listings = await prisma.milesListing.findMany({
      where,
      orderBy,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(listings);
  } catch (error) {
    console.error("Erro ao listar anúncios:", error);
    return NextResponse.json(
      { error: "Erro ao listar anúncios" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { program, amount, pricePerThousand, minPurchase, expiresAt } = body;

    if (!program || !amount || !pricePerThousand) {
      return NextResponse.json(
        { error: "Campos obrigatórios: program, amount, pricePerThousand" },
        { status: 400 }
      );
    }

    if (amount <= 0 || pricePerThousand <= 0) {
      return NextResponse.json(
        { error: "Quantidade e preço devem ser maiores que zero" },
        { status: 400 }
      );
    }

    const totalPrice = (amount / 1000) * pricePerThousand;

    const listing = await prisma.milesListing.create({
      data: {
        sellerId: session.user.id,
        program,
        amount,
        pricePerThousand,
        totalPrice,
        minPurchase: minPurchase || 1000,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar anúncio:", error);
    return NextResponse.json(
      { error: "Erro ao criar anúncio" },
      { status: 500 }
    );
  }
}
