import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    const searches = await prisma.flightSearch.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Since FlightSearch doesn't have a direct User relation in the schema,
    // we need to manually join user info for searches that have a userId
    const userIds = searches
      .map((s) => s.userId)
      .filter((id): id is string => id !== null);

    const uniqueUserIds = Array.from(new Set(userIds));

    const users = uniqueUserIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: uniqueUserIds } },
          select: { id: true, name: true, email: true },
        })
      : [];

    const usersMap = new Map(users.map((u) => [u.id, u]));

    let results = searches.map((s) => ({
      ...s,
      user: s.userId ? usersMap.get(s.userId) || null : null,
    }));

    // Apply user search filter if provided
    if (search) {
      const lowerSearch = search.toLowerCase();
      results = results.filter((s) => {
        if (!s.user) return false;
        return (
          (s.user.name && s.user.name.toLowerCase().includes(lowerSearch)) ||
          s.user.email.toLowerCase().includes(lowerSearch)
        );
      });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Erro ao listar buscas de voos:", error);
    return NextResponse.json(
      { error: "Erro ao listar buscas de voos" },
      { status: 500 }
    );
  }
}
