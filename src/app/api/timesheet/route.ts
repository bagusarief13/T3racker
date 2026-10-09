import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getIndonesianHolidays } from "@/lib/holidays";
import {
  calculateWorkHoursAndOvertime,
  getIndonesianDayName,
} from "@/lib/time-calc";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const now = new Date();
  const year = parseInt(searchParams.get("year") || `${now.getFullYear()}`, 10);
  const month = parseInt(searchParams.get("month") || `${now.getMonth() + 1}`, 10); // 1-12

  // Fetch or create profile
  let profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    profile = await prisma.profile.create({
      data: {
        userId: user.id,
        nama: user.username || "",
        npp: "",
        staffId: "",
        divisi: "",
        departemen: "",
        kelompok: "",
        defaultProject: "",
        pemohonName: user.username || "",
        diperiksaName: "",
        disetujuiName: "",
      },
    });
  }

  // Get national holidays & custom overrides
  const nationalHolidays = await getIndonesianHolidays(year);
  const customOverrides = await prisma.holidayOverride.findMany({
    where: {
      userId: user.id,
      dateStr: { startsWith: `${year}-${month.toString().padStart(2, "0")}` },
    },
  });

  const overrideMap: Record<string, { name: string; isHoliday: boolean }> = {};
  for (const ov of customOverrides) {
    overrideMap[ov.dateStr] = { name: ov.name, isHoliday: ov.isHoliday };
  }

  // Check if month already exists
  let timesheetMonth = await prisma.timesheetMonth.findUnique({
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

  // If not created yet, populate days of the month
  if (!timesheetMonth) {
    const daysInMonth = new Date(year, month, 0).getDate();
    const daysData = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay(); // 0 = Minggu, 6 = Sabtu
      const dayName = getIndonesianDayName(date);
      const dateStr = `${year}-${month.toString().padStart(2, "0")}-${day
        .toString()
        .padStart(2, "0")}`;

      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      let isHoliday = false;
      let holidayName: string | null = null;

      if (overrideMap[dateStr] !== undefined) {
        isHoliday = overrideMap[dateStr].isHoliday;
        holidayName = overrideMap[dateStr].name;
      } else if (nationalHolidays[dateStr]) {
        isHoliday = true;
        holidayName = nationalHolidays[dateStr];
      }

      let kegiatan = "";
      if (isWeekend) {
        kegiatan = dayOfWeek === 6 ? "Sabtu" : "Minggu";
      } else if (isHoliday && holidayName) {
        kegiatan = holidayName;
      }

      daysData.push({
        day,
        dateStr,
        dayName,
        isWeekend,
        isHoliday,
        holidayName,
        jamMasuk: "",
        jamPulang: "",
        totalJamKerja: "",
        totalMinutes: 0,
        statusKehadiran: "",
        isLembur: false,
        project: isWeekend || isHoliday ? "" : profile.defaultProject || "",
        projectCode: profile.defaultProjectCode || "",
        aipFitur: profile.defaultAipFitur || "",
        kegiatan,
        overtimeNotes: "",
      });
    }

    timesheetMonth = await prisma.timesheetMonth.create({
      data: {
        userId: user.id,
        year,
        month,
        days: {
          create: daysData,
        },
      },
      include: {
        days: {
          orderBy: { day: "asc" },
        },
      },
    });
  }

  return NextResponse.json({
    timesheetMonth,
    profile: profile || null,
  });
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { timesheetMonthId, days, autoCalculate } = body;

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    const stdIn = profile?.standardCheckIn || "08:30";
    const stdOut = profile?.standardCheckOut || "17:00";

    // Process each day update
    for (const d of days) {
      let isLembur = d.isLembur;
      let totalJamKerja = d.totalJamKerja;
      let totalMinutes = d.totalMinutes || 0;
      let statusKehadiran = d.statusKehadiran || "";

      if (autoCalculate && d.jamMasuk && d.jamPulang) {
        const calc = calculateWorkHoursAndOvertime(
          d.jamMasuk,
          d.jamPulang,
          d.isWeekend,
          d.isHoliday,
          stdIn,
          stdOut
        );
        totalJamKerja = calc.formattedTotal;
        totalMinutes = calc.totalMinutes;
        isLembur = calc.isOvertime;
        if (!statusKehadiran && calc.attendanceStatus) {
          statusKehadiran = calc.attendanceStatus;
        }
      }

      if (timesheetMonthId && d.day) {
        await prisma.timesheetDay.upsert({
          where: {
            timesheetMonthId_day: {
              timesheetMonthId,
              day: d.day,
            },
          },
          update: {
            jamMasuk: d.jamMasuk ?? "",
            jamPulang: d.jamPulang ?? "",
            totalJamKerja: totalJamKerja ?? "",
            totalMinutes: totalMinutes ?? 0,
            statusKehadiran: statusKehadiran ?? "",
            isLembur: isLembur ?? false,
            project: d.project ?? "",
            projectCode: d.projectCode ?? "",
            aipFitur: d.aipFitur ?? "",
            kegiatan: d.kegiatan ?? "",
            overtimeNotes: d.overtimeNotes ?? "",
          },
          create: {
            timesheetMonthId,
            day: d.day,
            dateStr: d.dateStr || "",
            dayName: d.dayName || "",
            isWeekend: d.isWeekend ?? false,
            isHoliday: d.isHoliday ?? false,
            holidayName: d.holidayName || null,
            jamMasuk: d.jamMasuk ?? "",
            jamPulang: d.jamPulang ?? "",
            totalJamKerja: totalJamKerja ?? "",
            totalMinutes: totalMinutes ?? 0,
            statusKehadiran: statusKehadiran ?? "",
            isLembur: isLembur ?? false,
            project: d.project ?? "",
            projectCode: d.projectCode ?? "",
            aipFitur: d.aipFitur ?? "",
            kegiatan: d.kegiatan ?? "",
            overtimeNotes: d.overtimeNotes ?? "",
          },
        });
      } else if (d.id) {
        await prisma.timesheetDay.update({
          where: { id: d.id },
          data: {
            jamMasuk: d.jamMasuk ?? "",
            jamPulang: d.jamPulang ?? "",
            totalJamKerja: totalJamKerja ?? "",
            totalMinutes: totalMinutes ?? 0,
            statusKehadiran: statusKehadiran ?? "",
            isLembur: isLembur ?? false,
            project: d.project ?? "",
            projectCode: d.projectCode ?? "",
            aipFitur: d.aipFitur ?? "",
            kegiatan: d.kegiatan ?? "",
            overtimeNotes: d.overtimeNotes ?? "",
          },
        });
      }
    }

    const updatedMonth = await prisma.timesheetMonth.findUnique({
      where: { id: timesheetMonthId },
      include: {
        days: {
          orderBy: { day: "asc" },
        },
      },
    });

    return NextResponse.json({ success: true, timesheetMonth: updatedMonth });
  } catch (error) {
    console.error("Timesheet update error:", error);
    return NextResponse.json({ error: "Gagal memperbarui data timesheet." }, { status: 500 });
  }
}
