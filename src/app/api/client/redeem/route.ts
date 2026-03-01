import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { productId, tripId } = await req.json();
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  if (productId) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }
    if (product.stock <= 0) {
      return NextResponse.json({ error: "Produto indisponível" }, { status: 400 });
    }
    if (user.points < product.pointsCost) {
      return NextResponse.json({ error: "Pontos insuficientes" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { points: { decrement: product.pointsCost } },
      }),
      prisma.pointTransaction.create({
        data: {
          userId: user.id,
          type: "RESGATE",
          amount: -product.pointsCost,
          description: `Resgate: ${product.name}`,
        },
      }),
      prisma.order.create({
        data: {
          userId: user.id,
          productId: product.id,
          points: product.pointsCost,
          status: "CONFIRMADO",
        },
      }),
      prisma.product.update({
        where: { id: product.id },
        data: { stock: { decrement: 1 } },
      }),
    ]);

    return NextResponse.json({ success: true, message: "Produto resgatado!" });
  }

  if (tripId) {
    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) {
      return NextResponse.json({ error: "Viagem não encontrada" }, { status: 404 });
    }
    if (trip.spots <= 0) {
      return NextResponse.json({ error: "Sem vagas disponíveis" }, { status: 400 });
    }
    if (user.points < trip.pointsCost) {
      return NextResponse.json({ error: "Pontos insuficientes" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { points: { decrement: trip.pointsCost } },
      }),
      prisma.pointTransaction.create({
        data: {
          userId: user.id,
          type: "RESGATE",
          amount: -trip.pointsCost,
          description: `Reserva: ${trip.destination}`,
        },
      }),
      prisma.tripBooking.create({
        data: {
          userId: user.id,
          tripId: trip.id,
          points: trip.pointsCost,
          status: "CONFIRMADO",
        },
      }),
      prisma.trip.update({
        where: { id: trip.id },
        data: { spots: { decrement: 1 } },
      }),
    ]);

    return NextResponse.json({ success: true, message: "Viagem reservada!" });
  }

  return NextResponse.json({ error: "Produto ou viagem não especificado" }, { status: 400 });
}
