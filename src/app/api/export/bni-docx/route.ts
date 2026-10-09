import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { generateBniDocx } from "@/lib/docx-bni-generator";
import { formatTableDate, getIndonesianDayName, getIndonesianMonthName } from "@/lib/time-calc";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const now = new Date();
  const year = parseInt(searchParams.get("year") || `${now.getFullYear()}`, 10);
  const month = parseInt(searchParams.get("month") || `${now.getMonth() + 1}`, 10);

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  const timesheetMonth = await prisma.timesheetMonth.findUnique({
    where: {
      userId_year_month: {
        userId: user.id,
        year,
        month,
      },
    },
    include: {
      days: {
        where: { isLembur: true },
        orderBy: { day: "asc" },
      },
    },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profil tidak ditemukan." }, { status: 404 });
  }

  const monthName = getIndonesianMonthName(month - 1);

  // Next month 1st date for signing date
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const signingDateStr = `01 ${getIndonesianMonthName(nextMonth - 1)} ${nextYear}`;

  const overtimeDays = (timesheetMonth?.days || []).map((d) => {
    const dateObj = new Date(year, month - 1, d.day);
    const dayOfWeek = dateObj.getDay();
    const isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6 || d.isWeekend;
    const dayName = getIndonesianDayName(dateObj);

    return {
      day: d.day,
      dateFormatted: `${dayName} ${d.day} ${monthName} ${year}`,
      dateShort: formatTableDate(dateObj),
      dateWithYear: `${d.day} ${monthName} ${year}`,
      jamMasuk: d.jamMasuk || (isWeekendDay || d.isHoliday ? "9:30" : "17:00"),
      jamPulang: d.jamPulang || "20:00",
      isWeekend: isWeekendDay,
      isHoliday: d.isHoliday,
      holidayName: d.holidayName,
      kegiatan: d.overtimeNotes || d.kegiatan || "Penyelesaian tugas sprint dan fixing defect",
    };
  });

  const buffer = await generateBniDocx({
    profile: {
      nama: profile.nama,
      npp: profile.npp,
      staffId: profile.staffId || "K-2514",
      divisi: profile.divisi || "DIVISI OPERASIONAL",
      departemen: profile.departemen || "REL",
      location: profile.location || "Jakarta",
      pemohonName: profile.pemohonName || profile.nama,
      diperiksaName: profile.diperiksaName,
      disetujuiName: profile.disetujuiName,
      standardCheckOut: profile.standardCheckOut || "17:00",
      estOvertimeStart: profile.estOvertimeStart || "17.00",
      estOvertimeEnd: profile.estOvertimeEnd || "20.00",
    },
    signingDateStr,
    overtimeDays,
  });

  const safeName = profile.nama.replace(/[^a-zA-Z0-9]/g, "_");
  const fileName = `Form_Lembur_BNI_${safeName}_${monthName}_${year}.docx`;

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
