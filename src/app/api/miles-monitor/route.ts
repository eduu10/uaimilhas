import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const accounts = await prisma.userMilesAccount.findMany({
    where: { userId: session.user.id },
    orderBy: { program: "asc" },
  });

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return NextResponse.json({
    accounts,
    totalBalance,
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { program, balance, expiresAt } = body;

  if (!program || balance === undefined || balance === null) {
    return NextResponse.json(
      { error: "Programa e saldo são obrigatórios" },
      { status: 400 }
    );
  }

  const account = await prisma.userMilesAccount.upsert({
    where: {
      userId_program: {
        userId: session.user.id,
        program,
      },
    },
    update: {
      balance: parseInt(balance),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      lastUpdated: new Date(),
    },
    create: {
      userId: session.user.id,
      program,
      balance: parseInt(balance),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  return NextResponse.json(account);
}
