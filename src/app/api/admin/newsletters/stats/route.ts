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

    const [
      totalNewsletters,
      sentCount,
      draftCount,
      totalSubscribers,
      activeSubscribers,
      premiumNewsletters,
    ] = await Promise.all([
      prisma.newsletter.count(),
      prisma.newsletter.count({ where: { sentAt: { not: null } } }),
      prisma.newsletter.count({ where: { sentAt: null } }),
      prisma.newsletterSubscriber.count(),
      prisma.newsletterSubscriber.count({ where: { isActive: true } }),
      prisma.newsletter.count({ where: { isPremium: true } }),
    ]);

    return NextResponse.json({
      totalNewsletters,
      sentCount,
      draftCount,
      totalSubscribers,
      activeSubscribers,
      premiumNewsletters,
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas de newsletters:", error);
    return NextResponse.json(
      { error: "Erro ao buscar estatísticas de newsletters" },
      { status: 500 }
    );
  }
}
