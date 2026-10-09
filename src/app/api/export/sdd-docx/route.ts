import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { generateSddDocx } from "@/lib/docx-sdd-generator";
import { getIndonesianDayName, getIndonesianMonthName } from "@/lib/time-calc";
import { getVendorById } from "@/lib/vendors";

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

  const vendor = getVendorById(profile.vendor);
  const monthName = getIndonesianMonthName(month - 1);
  const overtimeDays = (timesheetMonth?.days || []).map((d) => {
    const dateObj = new Date(year, month - 1, d.day);
    const dayOfWeek = dateObj.getDay();
    const isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6 || d.isWeekend;
    const isHolidayOrWeekend = isWeekendDay || d.isHoliday;

    const dayName = getIndonesianDayName(dateObj);

    // Weekday overtime starts after standard office hours (default 17:00)
    // Weekend/holiday overtime starts from actual check-in (e.g. 9:30)
    const jamStart = isHolidayOrWeekend
      ? (d.jamMasuk || "09:00")
      : (profile.standardCheckOut || "17:00");
    const jamEnd = d.jamPulang || "20:00";

    return {
      dateFormatted: `${dayName} ${d.day} ${monthName} ${year}`,
      dateShort: `${d.day} ${monthName} ${year}`,
      jamMasuk: jamStart,
      jamPulang: jamEnd,
      kegiatan: d.overtimeNotes || d.kegiatan || "Penyelesaian tugas sprint dan fixing defect",
    };
  });

  const buffer = await generateSddDocx({
    profile: {
      nama: profile.nama,
      npp: profile.npp,
      departemen: profile.departemen,
      pemohonName: profile.pemohonName || profile.nama,
      diperiksaName: profile.diperiksaName,
      disetujuiName: profile.disetujuiName,
      vendor: profile.vendor || "sdd",
    },
    overtimeDays,
  });

  const safeName = profile.nama.replace(/[^a-zA-Z0-9]/g, "_");
  const vendorClean = vendor.shortName.replace(/[^a-zA-Z0-9]/g, "_");
  const fileName = `SPKL_${vendorClean}_${safeName}_${monthName}_${year}.docx`;

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
