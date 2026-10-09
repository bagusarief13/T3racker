import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { generateExcelTimesheet } from "@/lib/excel-generator";
import { formatTableDate, getIndonesianMonthName } from "@/lib/time-calc";
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
        orderBy: { day: "asc" },
      },
    },
  });

  if (!timesheetMonth || !profile) {
    return NextResponse.json({ error: "Timesheet belum dibuat untuk periode ini." }, { status: 404 });
  }

  const monthName = getIndonesianMonthName(month - 1);

  const formattedDays = timesheetMonth.days.map((d) => {
    const dateObj = new Date(year, month - 1, d.day);
    const dayOfWeek = dateObj.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    return {
      day: d.day,
      dateFormatted: formatTableDate(dateObj),
      jamMasuk: d.jamMasuk || "",
      jamPulang: d.jamPulang || "",
      totalJamKerja: d.totalJamKerja || "",
      statusKehadiran: d.statusKehadiran || "",
      isLembur: d.isLembur,
      project: d.project || "",
      projectCode: d.projectCode || "",
      aipFitur: d.aipFitur || "",
      kegiatan: d.kegiatan || "",
      isWeekend: isWeekend || d.isWeekend,
      isHoliday: d.isHoliday,
    };
  });

  const vendor = getVendorById(profile.vendor);
  const buffer = await generateExcelTimesheet({
    profile: {
      nama: profile.nama,
      npp: profile.npp,
      divisi: profile.divisi,
      departemen: profile.departemen,
      kelompok: profile.kelompok,
      pemohonName: profile.pemohonName || profile.nama,
      diperiksaName: profile.diperiksaName,
      disetujuiName: profile.disetujuiName,
      vendor: profile.vendor || "sdd",
    },
    year,
    monthName,
    days: formattedDays,
  });

  const safeName = profile.nama.replace(/[^a-zA-Z0-9]/g, "_");
  const vendorClean = vendor.shortName.replace(/[^a-zA-Z0-9]/g, "_");
  const fileName = `Absensi_Manual_${vendorClean}_${safeName}_${monthName}_${year}.xlsx`;

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
