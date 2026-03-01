import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { courseId } = await req.json();

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    return NextResponse.json({ error: "Curso não encontrado" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  if (course.accessType === "PONTOS" && user.points < course.pointsCost) {
    return NextResponse.json({ error: "Pontos insuficientes" }, { status: 400 });
  }

  // Debit points
  if (course.accessType === "PONTOS" && course.pointsCost > 0) {
    await prisma.user.update({
      where: { id: user.id },
      data: { points: { decrement: course.pointsCost } },
    });

    await prisma.pointTransaction.create({
      data: {
        userId: user.id,
        type: "RESGATE",
        amount: -course.pointsCost,
        description: `Desbloqueio do curso: ${course.title}`,
      },
    });
  }

  const enrollment = await prisma.enrollment.create({
    data: { userId: user.id, courseId },
  });

  return NextResponse.json(enrollment, { status: 201 });
}
