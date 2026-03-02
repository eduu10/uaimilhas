import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const saved = await prisma.savedFlight.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(saved);
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
    airline,
    price,
    miles,
    vpm,
    departureAt,
    returnAt,
    flightData,
  } = body;

  if (!origin || !destination || !airline || !price || !departureAt) {
    return NextResponse.json(
      { error: "Campos obrigatórios: origin, destination, airline, price, departureAt" },
      { status: 400 }
    );
  }

  const saved = await prisma.savedFlight.create({
    data: {
      userId: session.user.id,
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      airline,
      price: parseFloat(price),
      miles: miles ? parseInt(miles) : null,
      vpm: vpm ? parseFloat(vpm) : null,
      departureAt: new Date(departureAt),
      returnAt: returnAt ? new Date(returnAt) : null,
      flightData: flightData || null,
    },
  });

  return NextResponse.json(saved, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "ID é obrigatório" },
      { status: 400 }
    );
  }

  const saved = await prisma.savedFlight.findUnique({
    where: { id },
  });

  if (!saved) {
    return NextResponse.json(
      { error: "Voo salvo não encontrado" },
      { status: 404 }
    );
  }

  if (saved.userId !== session.user.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  await prisma.savedFlight.delete({ where: { id } });

  return NextResponse.json({ message: "Voo removido dos salvos" });
}
