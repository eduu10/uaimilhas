import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();

  // Ensure category exists
  let category = await prisma.category.findUnique({ where: { slug: body.categoryId } });
  if (!category) {
    category = await prisma.category.create({
      data: { name: body.categoryId, slug: body.categoryId },
    });
  }

  const product = await prisma.product.create({
    data: {
      name: body.name,
      description: body.description,
      images: body.images || [],
      pointsCost: body.pointsCost,
      stock: body.stock,
      categoryId: category.id,
    },
  });

  return NextResponse.json(product, { status: 201 });
}
