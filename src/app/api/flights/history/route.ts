import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");
  const days = parseInt(searchParams.get("days") || "30");

  if (!origin || !destination) {
    return NextResponse.json(
      { error: "Origem e destino são obrigatórios" },
      { status: 400 }
    );
  }

  const since = new Date();
  since.setDate(since.getDate() - days);

  const history = await prisma.priceHistory.findMany({
    where: {
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      recordedAt: { gte: since },
    },
    orderBy: { recordedAt: "asc" },
  });

  const grouped: Record<
    string,
    { date: string; prices: { airline: string | null; price: number; miles: number | null; cabinClass: string }[] }
  > = {};

  for (const record of history) {
    const dateKey = record.recordedAt.toISOString().split("T")[0];
    if (!grouped[dateKey]) {
      grouped[dateKey] = { date: dateKey, prices: [] };
    }
    grouped[dateKey].prices.push({
      airline: record.airline,
      price: record.price,
      miles: record.miles,
      cabinClass: record.cabinClass,
    });
  }

  const chartData = Object.values(grouped).map((day) => {
    const avgPrice =
      day.prices.reduce((sum, p) => sum + p.price, 0) / day.prices.length;
    const minPrice = Math.min(...day.prices.map((p) => p.price));
    const maxPrice = Math.max(...day.prices.map((p) => p.price));
    const milesEntries = day.prices.filter((p) => p.miles !== null);
    const avgMiles =
      milesEntries.length > 0
        ? milesEntries.reduce((sum, p) => sum + (p.miles || 0), 0) /
          milesEntries.length
        : null;

    return {
      date: day.date,
      avgPrice: parseFloat(avgPrice.toFixed(2)),
      minPrice,
      maxPrice,
      avgMiles: avgMiles ? Math.round(avgMiles) : null,
      records: day.prices.length,
    };
  });

  return NextResponse.json({
    origin: origin.toUpperCase(),
    destination: destination.toUpperCase(),
    days,
    history: chartData,
    totalRecords: history.length,
  });
}
