import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const AIRPORTS: Record<string, { city: string; name: string }> = {
  GRU: { city: "Sao Paulo", name: "Aeroporto de Guarulhos" },
  GIG: { city: "Rio de Janeiro", name: "Galeao" },
  BSB: { city: "Brasilia", name: "Aeroporto de Brasilia" },
  CNF: { city: "Belo Horizonte", name: "Confins" },
  SSA: { city: "Salvador", name: "Aeroporto de Salvador" },
  REC: { city: "Recife", name: "Guararapes" },
  CWB: { city: "Curitiba", name: "Afonso Pena" },
  POA: { city: "Porto Alegre", name: "Salgado Filho" },
  FOR: { city: "Fortaleza", name: "Pinto Martins" },
};

const AIRLINES = [
  { name: "LATAM", code: "LA" },
  { name: "GOL", code: "G3" },
  { name: "Azul", code: "AD" },
  { name: "Avianca", code: "AV" },
];

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateFlightNumber(airlineCode: string): string {
  return `${airlineCode}${randomBetween(1000, 9999)}`;
}

function generateDuration(stops: number): string {
  const baseMinutes = randomBetween(90, 180);
  const totalMinutes = baseMinutes + stops * randomBetween(45, 90);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h${minutes.toString().padStart(2, "0")}`;
}

function generateMockResults(
  origin: string,
  destination: string,
  departureDate: string,
  cabinClass: string,
  passengers: number
) {
  const results = [];
  const numResults = randomBetween(4, 10);

  for (let i = 0; i < numResults; i++) {
    const airline = AIRLINES[randomBetween(0, AIRLINES.length - 1)];
    const stops = randomBetween(0, 2);

    let basePrice: number;
    if (cabinClass === "business") {
      basePrice = randomBetween(1800, 6500);
    } else if (cabinClass === "first") {
      basePrice = randomBetween(5000, 15000);
    } else {
      basePrice = randomBetween(350, 2200);
    }

    const price = basePrice * passengers;

    let baseMiles: number;
    if (cabinClass === "business") {
      baseMiles = randomBetween(35000, 120000);
    } else if (cabinClass === "first") {
      baseMiles = randomBetween(80000, 250000);
    } else {
      baseMiles = randomBetween(8000, 45000);
    }

    const miles = baseMiles * passengers;
    const vpm = price / (miles / 1000);

    const depHour = randomBetween(5, 22);
    const depMinute = randomBetween(0, 59);
    const duration = generateDuration(stops);

    const durationMatch = duration.match(/(\d+)h(\d+)/);
    const durationMinutes = durationMatch
      ? parseInt(durationMatch[1]) * 60 + parseInt(durationMatch[2])
      : 120;
    const arrMinutes = depHour * 60 + depMinute + durationMinutes;
    const arrHour = Math.floor(arrMinutes / 60) % 24;
    const arrMinute = arrMinutes % 60;

    const departureTime = `${depHour.toString().padStart(2, "0")}:${depMinute.toString().padStart(2, "0")}`;
    const arrivalTime = `${arrHour.toString().padStart(2, "0")}:${arrMinute.toString().padStart(2, "0")}`;

    results.push({
      id: `flight_${Date.now()}_${i}`,
      airline: airline.name,
      airlineCode: airline.code,
      flightNumber: generateFlightNumber(airline.code),
      origin,
      destination,
      originInfo: AIRPORTS[origin] || { city: origin, name: origin },
      destinationInfo: AIRPORTS[destination] || {
        city: destination,
        name: destination,
      },
      departureDate,
      departureTime,
      arrivalTime,
      duration,
      stops,
      cabinClass,
      passengers,
      price,
      miles,
      vpm: parseFloat(vpm.toFixed(2)),
      currency: "BRL",
    });
  }

  return results.sort((a, b) => a.price - b.price);
}

export async function POST(req: Request) {
  const body = await req.json();
  const {
    origin,
    destination,
    departureDate,
    returnDate,
    passengers = 1,
    cabinClass = "economy",
  } = body;

  if (!origin || !destination || !departureDate) {
    return NextResponse.json(
      { error: "Origem, destino e data de ida são obrigatórios" },
      { status: 400 }
    );
  }

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id || null;

  const outboundResults = generateMockResults(
    origin.toUpperCase(),
    destination.toUpperCase(),
    departureDate,
    cabinClass,
    passengers
  );

  let returnResults: ReturnType<typeof generateMockResults> = [];
  if (returnDate) {
    returnResults = generateMockResults(
      destination.toUpperCase(),
      origin.toUpperCase(),
      returnDate,
      cabinClass,
      passengers
    );
  }

  const allResults = {
    outbound: outboundResults,
    return: returnResults,
    searchParams: {
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      departureDate,
      returnDate: returnDate || null,
      passengers,
      cabinClass,
    },
    totalResults: outboundResults.length + returnResults.length,
  };

  const search = await prisma.flightSearch.create({
    data: {
      userId,
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      departureDate: new Date(departureDate),
      returnDate: returnDate ? new Date(returnDate) : null,
      passengers,
      cabinClass,
      results: JSON.stringify(allResults),
    },
  });

  return NextResponse.json({
    searchId: search.id,
    ...allResults,
  });
}
