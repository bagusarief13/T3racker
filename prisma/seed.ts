import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("123456", 10);

  // Upsert user Bagus
  const user = await prisma.user.upsert({
    where: { username: "bagus" },
    update: {},
    create: {
      username: "bagus",
      email: "bagus.arief@bni.co.id",
      password: hashedPassword,
      profile: {
        create: {
          nama: "Bagus Arief Maulana",
          npp: "901707",
          staffId: "K-2514",
          divisi: "RDL",
          departemen: "REL",
          kelompok: "CLD",
          defaultProject: "Collection",
          pemohonName: "Bagus Arief Maulana",
          diperiksaName: "Hermawan Tri Rosanja",
          disetujuiName: "Syaiful Effendi",
          location: "Jakarta",
          standardCheckIn: "08:30",
          standardCheckOut: "17:00",
          estOvertimeStart: "17:00",
          estOvertimeEnd: "20:00",
        },
      },
    },
    include: { profile: true },
  });

  console.log("User seeded:", user.username);

  // Seed August 2026 with exact data from PDF
  const augData = [
    { day: 1, jamMasuk: "", jamPulang: "", totalJamKerja: "", statusKehadiran: "", isLembur: false, project: "", kegiatan: "Sabtu" },
    { day: 2, jamMasuk: "", jamPulang: "", totalJamKerja: "", statusKehadiran: "", isLembur: false, project: "", kegiatan: "Minggu" },
    { day: 3, jamMasuk: "7:48", jamPulang: "21:05", totalJamKerja: "13:17", statusKehadiran: "H", isLembur: true, project: "Collection", kegiatan: "fix state management still keep the filter state when page changes, refactor halaman penugasan add missing columns, update logic selection of strategy and management pegawai, fix logout infinite loop navigate bug" },
    { day: 4, jamMasuk: "8:02", jamPulang: "18:17", totalJamKerja: "10:15", statusKehadiran: "H", isLembur: false, project: "Collection", kegiatan: "fixing deployment error on collection FE, fix select all product logic to hide SME from select all selection, cleans up repository, add rearrange function on account strategy" },
    { day: 5, jamMasuk: "8:14", jamPulang: "17:21", totalJamKerja: "9:07", statusKehadiran: "H", isLembur: false, project: "Collection", kegiatan: "limit input NPP to numeric 10 digit, show cycle field when choosing cardlink on strategy form field" },
    { day: 6, jamMasuk: "8:03", jamPulang: "22:12", totalJamKerja: "14:08", statusKehadiran: "H", isLembur: true, project: "Collection", kegiatan: "validate minimum promise pay date & missing column created by and created date, assisting in hardening device and setup repo for new FE, update to accept configuration to accept public configuration, update logic mapping strategy, update api call for rearrange function, change cycle to blok A-Z non-blok" },
    { day: 7, jamMasuk: "7:42", jamPulang: "23:39", totalJamKerja: "15:57", statusKehadiran: "H", isLembur: true, project: "Collection", kegiatan: "update filter & mapping response pemantauan akun, update janji option di promise to pay, fix bugs auto select product & bucket di management pegawai region rcr pusat" },
    { day: 8, jamMasuk: "", jamPulang: "", totalJamKerja: "", statusKehadiran: "", isLembur: false, project: "", kegiatan: "Sabtu" },
    { day: 9, jamMasuk: "", jamPulang: "", totalJamKerja: "", statusKehadiran: "", isLembur: false, project: "", kegiatan: "Minggu" },
    { day: 10, jamMasuk: "", jamPulang: "", totalJamKerja: "", statusKehadiran: "S", isLembur: false, project: "Collection", kegiatan: "Sick Leave" },
    { day: 11, jamMasuk: "8:01", jamPulang: "21:24", totalJamKerja: "13:22", statusKehadiran: "H", isLembur: true, project: "Collection", kegiatan: "reapply mfe report into collection, update UI and api call per role report" },
    { day: 12, jamMasuk: "8:18", jamPulang: "22:18", totalJamKerja: "13:59", statusKehadiran: "H", isLembur: true, project: "Collection", kegiatan: "update perbaikan response mapping report & logic filter" },
    { day: 13, jamMasuk: "7:58", jamPulang: "23:59", totalJamKerja: "16:01", statusKehadiran: "H", isLembur: true, project: "Collection", kegiatan: "implement download report per role and checking permission in reports endpoint for each role" },
    { day: 14, jamMasuk: "0:00", jamPulang: "9:00", totalJamKerja: "9:00", statusKehadiran: "H", isLembur: false, project: "Collection", kegiatan: "Support issue deployment OCP untuk collection" },
    { day: 15, jamMasuk: "", jamPulang: "", totalJamKerja: "", statusKehadiran: "", isLembur: false, project: "", kegiatan: "Sabtu" },
    { day: 16, jamMasuk: "", jamPulang: "", totalJamKerja: "", statusKehadiran: "", isLembur: false, project: "", kegiatan: "Minggu" },
    { day: 17, jamMasuk: "", jamPulang: "", totalJamKerja: "", statusKehadiran: "", isLembur: false, project: "", kegiatan: "HUT Republik Indonesia" },
    { day: 18, jamMasuk: "8:17", jamPulang: "21:16", totalJamKerja: "12:59", statusKehadiran: "H", isLembur: true, project: "Collection", kegiatan: "Support smoothing collection for UAT and fixing defect" },
    { day: 19, jamMasuk: "8:15", jamPulang: "22:33", totalJamKerja: "14:18", statusKehadiran: "H", isLembur: true, project: "Collection", kegiatan: "fixing defect and supporting UAT Deployment" },
    { day: 20, jamMasuk: "8:05", jamPulang: "19:32", totalJamKerja: "11:27", statusKehadiran: "H", isLembur: false, project: "Collection", kegiatan: "supporting UAT Deployment and fixing SAST FE" },
    { day: 21, jamMasuk: "7:47", jamPulang: "22:34", totalJamKerja: "14:46", statusKehadiran: "H", isLembur: true, project: "Collection", kegiatan: "fix defect & support SIT" },
    { day: 22, jamMasuk: "", jamPulang: "", totalJamKerja: "", statusKehadiran: "", isLembur: false, project: "", kegiatan: "Sabtu" },
    { day: 23, jamMasuk: "", jamPulang: "", totalJamKerja: "", statusKehadiran: "", isLembur: false, project: "", kegiatan: "Minggu" },
    { day: 24, jamMasuk: "8:00", jamPulang: "22:07", totalJamKerja: "14:06", statusKehadiran: "H", isLembur: true, project: "Collection", kegiatan: "fix defect & support SIT & UAT" },
    { day: 25, jamMasuk: "", jamPulang: "", totalJamKerja: "", statusKehadiran: "", isLembur: false, project: "", kegiatan: "Maulid Nabi Muhammad SAW" },
    { day: 26, jamMasuk: "8:16", jamPulang: "21:58", totalJamKerja: "13:41", statusKehadiran: "H", isLembur: true, project: "Collection", kegiatan: "fix defect & support UAT" },
    { day: 27, jamMasuk: "7:46", jamPulang: "14:30", totalJamKerja: "6:43", statusKehadiran: "H", isLembur: false, project: "Collection", kegiatan: "fix defect & support UAT (Halfday dikarenakan Demonstrasi 27/08/2026 di DPR RI)" },
    { day: 28, jamMasuk: "11:13", jamPulang: "18:12", totalJamKerja: "6:59", statusKehadiran: "H", isLembur: false, project: "Collection", kegiatan: "fix defect & support UAT (Halfday dikarenakan Demonstrasi 27/08/2026 di DPR RI)" },
    { day: 29, jamMasuk: "", jamPulang: "", totalJamKerja: "", statusKehadiran: "", isLembur: false, project: "", kegiatan: "Sabtu" },
    { day: 30, jamMasuk: "", jamPulang: "", totalJamKerja: "", statusKehadiran: "", isLembur: false, project: "", kegiatan: "Minggu" },
    { day: 31, jamMasuk: "8:23", jamPulang: "22:10", totalJamKerja: "13:47", statusKehadiran: "H", isLembur: true, project: "Collection", kegiatan: "fix defect & support UAT" },
  ];

  // Delete existing August 2026 if any
  await prisma.timesheetMonth.deleteMany({
    where: { userId: user.id, year: 2026, month: 8 },
  });

  const daysToCreate = augData.map((d) => {
    const date = new Date(2026, 7, d.day);
    const dayOfWeek = date.getDay();
    const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = d.day === 17 || d.day === 25;

    let totalMinutes = 0;
    if (d.totalJamKerja) {
      const [h, m] = d.totalJamKerja.split(":").map(Number);
      totalMinutes = h * 60 + m;
    }

    return {
      day: d.day,
      dateStr: `2026-08-${d.day.toString().padStart(2, "0")}`,
      dayName: dayNames[dayOfWeek],
      isWeekend,
      isHoliday,
      holidayName: isHoliday ? d.kegiatan : null,
      jamMasuk: d.jamMasuk,
      jamPulang: d.jamPulang,
      totalJamKerja: d.totalJamKerja,
      totalMinutes,
      statusKehadiran: d.statusKehadiran,
      isLembur: d.isLembur,
      project: d.project,
      projectCode: "",
      aipFitur: "",
      kegiatan: d.kegiatan,
      overtimeNotes: "",
    };
  });

  await prisma.timesheetMonth.create({
    data: {
      userId: user.id,
      year: 2026,
      month: 8,
      days: {
        create: daysToCreate,
      },
    },
  });

  console.log("August 2026 timesheet seeded successfully with 31 days!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
