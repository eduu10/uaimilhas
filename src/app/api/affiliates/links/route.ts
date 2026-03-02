import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const links = await prisma.affiliateLink.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { clicks: true },
        },
        clicks: {
          where: { converted: true },
          select: {
            revenue: true,
          },
        },
      },
    });

    const linksWithStats = links.map((link) => {
      const totalEarnings = link.clicks.reduce(
        (sum, click) => sum + click.revenue,
        0
      );
      return {
        id: link.id,
        userId: link.userId,
        name: link.name,
        url: link.url,
        code: link.code,
        commission: link.commission,
        category: link.category,
        isActive: link.isActive,
        createdAt: link.createdAt,
        updatedAt: link.updatedAt,
        clickCount: link._count.clicks,
        totalEarnings,
      };
    });

    return NextResponse.json(linksWithStats);
  } catch (error) {
    console.error("Erro ao listar links de afiliado:", error);
    return NextResponse.json(
      { error: "Erro ao listar links de afiliado" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { name, url, commission, category } = body;

    if (!name || !url) {
      return NextResponse.json(
        { error: "Campos obrigatórios: name, url" },
        { status: 400 }
      );
    }

    const code = uuidv4().substring(0, 8);

    const link = await prisma.affiliateLink.create({
      data: {
        userId: session.user.id,
        name,
        url,
        code,
        commission: commission || 0,
        category: category || null,
      },
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar link de afiliado:", error);
    return NextResponse.json(
      { error: "Erro ao criar link de afiliado" },
      { status: 500 }
    );
  }
}
