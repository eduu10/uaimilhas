import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, name: true, email: true, points: true, tier: true, image: true,
      transactions: { orderBy: { createdAt: "desc" }, take: 10 },
      subscription: { include: { plan: true } },
    },
  });

  return NextResponse.json(user);
}
