import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const transactions = await prisma.pointTransaction.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(transactions);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { userId, amount, type, description } = await req.json();

  await prisma.pointTransaction.create({
    data: { userId, amount, type: type || "AJUSTE", description: description || "Ajuste manual" },
  });

  const user = await prisma.user.update({
    where: { id: userId },
    data: { points: { increment: amount } },
  });

  // Update tier
  let tier: "BRONZE" | "PRATA" | "OURO" | "DIAMANTE" = "BRONZE";
  if (user.points >= 10000) tier = "DIAMANTE";
  else if (user.points >= 5000) tier = "OURO";
  else if (user.points >= 1000) tier = "PRATA";

  await prisma.user.update({ where: { id: userId }, data: { tier } });

  return NextResponse.json({ success: true });
}
