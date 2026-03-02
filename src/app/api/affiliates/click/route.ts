import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json(
        { error: "Campo obrigatório: code" },
        { status: 400 }
      );
    }

    const link = await prisma.affiliateLink.findUnique({
      where: { code },
    });

    if (!link) {
      return NextResponse.json(
        { error: "Link não encontrado" },
        { status: 404 }
      );
    }

    if (!link.isActive) {
      return NextResponse.json(
        { error: "Este link está desativado" },
        { status: 400 }
      );
    }

    const headers = req.headers;
    const ip = headers.get("x-forwarded-for") || headers.get("x-real-ip") || null;
    const userAgent = headers.get("user-agent") || null;
    const referrer = headers.get("referer") || null;

    const click = await prisma.affiliateClick.create({
      data: {
        linkId: link.id,
        ip,
        userAgent,
        referrer,
      },
    });

    return NextResponse.json({
      success: true,
      redirectUrl: link.url,
      clickId: click.id,
    });
  } catch (error) {
    console.error("Erro ao registrar clique:", error);
    return NextResponse.json(
      { error: "Erro ao registrar clique" },
      { status: 500 }
    );
  }
}
