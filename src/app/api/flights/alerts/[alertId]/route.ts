import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { alertId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const alert = await prisma.flightAlert.findUnique({
    where: { id: params.alertId },
  });

  if (!alert) {
    return NextResponse.json(
      { error: "Alerta não encontrado" },
      { status: 404 }
    );
  }

  if (alert.userId !== session.user.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
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
    isActive,
  } = body;

  const updated = await prisma.flightAlert.update({
    where: { id: params.alertId },
    data: {
      ...(origin !== undefined && { origin: origin.toUpperCase() }),
      ...(destination !== undefined && {
        destination: destination.toUpperCase(),
      }),
      ...(departureDate !== undefined && {
        departureDate: departureDate ? new Date(departureDate) : null,
      }),
      ...(returnDate !== undefined && {
        returnDate: returnDate ? new Date(returnDate) : null,
      }),
      ...(maxPrice !== undefined && {
        maxPrice: maxPrice ? parseFloat(maxPrice) : null,
      }),
      ...(maxMiles !== undefined && {
        maxMiles: maxMiles ? parseInt(maxMiles) : null,
      }),
      ...(airline !== undefined && { airline: airline || null }),
      ...(frequency !== undefined && { frequency }),
      ...(isActive !== undefined && { isActive }),
    },
    include: {
      _count: { select: { notifications: true } },
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: { alertId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const alert = await prisma.flightAlert.findUnique({
    where: { id: params.alertId },
  });

  if (!alert) {
    return NextResponse.json(
      { error: "Alerta não encontrado" },
      { status: 404 }
    );
  }

  if (alert.userId !== session.user.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  await prisma.flightAlert.delete({ where: { id: params.alertId } });

  return NextResponse.json({ message: "Alerta excluído" });
}
