import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const [totalSearches, totalAlerts, activeAlerts, totalSavedFlights] =
      await Promise.all([
        prisma.flightSearch.count(),
        prisma.flightAlert.count(),
        prisma.flightAlert.count({ where: { isActive: true } }),
        prisma.savedFlight.count(),
      ]);

    return NextResponse.json({
      totalSearches,
      totalAlerts,
      activeAlerts,
      totalSavedFlights,
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas de voos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar estatísticas de voos" },
      { status: 500 }
    );
  }
}
