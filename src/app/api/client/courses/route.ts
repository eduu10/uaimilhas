import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const [enrollments, available] = await Promise.all([
    prisma.enrollment.findMany({
      where: { userId: session.user.id },
      include: { course: true },
    }),
    prisma.course.findMany({
      where: {
        isPublished: true,
        enrollments: { none: { userId: session.user.id } },
      },
    }),
  ]);

  return NextResponse.json({ enrollments, available });
}
