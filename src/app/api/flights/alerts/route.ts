import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const alerts = await prisma.flightAlert.findMany({
    where: { userId: session.user.id },
    include: {
      _count: { select: { notifications: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(alerts);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const {
    origin,
    destination,
    departureDate,
    returnDate,
    maxPrice,
    maxMiles,
    airline,
    frequency,
  } = body;

  if (!origin || !destination) {
    return NextResponse.json(
      { error: "Origem e destino são obrigatórios" },
      { status: 400 }
    );
  }

  const alert = await prisma.flightAlert.create({
    data: {
      userId: session.user.id,
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      departureDate: departureDate ? new Date(departureDate) : null,
      returnDate: returnDate ? new Date(returnDate) : null,
      maxPrice: maxPrice ? parseFloat(maxPrice) : null,
      maxMiles: maxMiles ? parseInt(maxMiles) : null,
      airline: airline || null,
      frequency: frequency || "daily",
    },
    include: {
      _count: { select: { notifications: true } },
    },
  });

  return NextResponse.json(alert, { status: 201 });
}
