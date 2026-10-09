import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getIndonesianHolidays } from "@/lib/holidays";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get("year") || `${new Date().getFullYear()}`, 10);

  const nationalHolidays = await getIndonesianHolidays(year);

  const user = await getCurrentUser();
  let overrides: Record<string, { name: string; isHoliday: boolean }> = {};

  if (user) {
    const dbOverrides = await prisma.holidayOverride.findMany({
      where: {
        userId: user.id,
        dateStr: { startsWith: `${year}-` },
      },
    });

    for (const ov of dbOverrides) {
      overrides[ov.dateStr] = { name: ov.name, isHoliday: ov.isHoliday };
    }
  }

  return NextResponse.json({
    nationalHolidays,
    overrides,
  });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { dateStr, name, isHoliday, action } = await req.json();

    if (action === "delete") {
      await prisma.holidayOverride.deleteMany({
        where: { userId: user.id, dateStr },
      });
      return NextResponse.json({ success: true });
    }

    const saved = await prisma.holidayOverride.upsert({
      where: {
        userId_dateStr: {
          userId: user.id,
          dateStr,
        },
      },
      update: {
        name,
        isHoliday: isHoliday ?? true,
      },
      create: {
        userId: user.id,
        dateStr,
        name,
        isHoliday: isHoliday ?? true,
      },
    });

    return NextResponse.json({ success: true, item: saved });
  } catch (error) {
    console.error("Holiday override error:", error);
    return NextResponse.json({ error: "Gagal memperbarui data libur." }, { status: 500 });
  }
}
