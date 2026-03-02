import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { alertId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const existing = await prisma.flightAlert.findUnique({
      where: { id: params.alertId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Alerta não encontrado" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const updateData: any = {};

    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.origin !== undefined) updateData.origin = body.origin;
    if (body.destination !== undefined) updateData.destination = body.destination;
    if (body.maxPrice !== undefined) updateData.maxPrice = body.maxPrice;
    if (body.maxMiles !== undefined) updateData.maxMiles = body.maxMiles;
    if (body.airline !== undefined) updateData.airline = body.airline;
    if (body.frequency !== undefined) updateData.frequency = body.frequency;

    const alert = await prisma.flightAlert.update({
      where: { id: params.alertId },
      data: updateData,
    });

    return NextResponse.json(alert);
  } catch (error) {
    console.error("Erro ao atualizar alerta de voo:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar alerta de voo" },
      { status: 500 }
    );
  }
}
