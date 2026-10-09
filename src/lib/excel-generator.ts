import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";
import { getVendorById } from "./vendors";

export interface TimesheetExportData {
  profile: {
    nama: string;
    npp: string;
    divisi: string;
    departemen: string;
    kelompok: string;
    pemohonName: string;
    diperiksaName: string;
    disetujuiName: string;
    vendor?: string;
  };
  year: number;
  monthName: string;
  days: Array<{
    day: number;
    dateFormatted: string; // e.g. "1-Aug-26"
    jamMasuk: string;
    jamPulang: string;
    totalJamKerja: string;
    statusKehadiran: string; // "H", "C", "I", "S"
    isLembur: boolean;
    project: string;
    projectCode: string;
    aipFitur: string;
    kegiatan: string;
    isWeekend: boolean;
    isHoliday: boolean;
  }>;
}

export async function generateExcelTimesheet(data: TimesheetExportData): Promise<Buffer> {
  const vendor = getVendorById(data.profile.vendor);
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "T3racker";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Absensi Manual", {
    pageSetup: {
      paperSize: 9, // A4
      orientation: "portrait",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: 0.3,
        right: 0.3,
        top: 0.4,
        bottom: 0.4,
        header: 0.2,
        footer: 0.2,
      },
    },
  });

  // Column definitions & widths
  worksheet.columns = [
    { key: "no", width: 5 }, // A
    { key: "tanggal", width: 14 }, // B (accommodates 30% larger vendor logo)
    { key: "jamMasuk", width: 12 }, // C (fits "DEPARTEMEN" in Calibri 11 bold)
    { key: "jamPulang", width: 10 }, // D
    { key: "totalJam", width: 10 }, // E
    { key: "hadir", width: 6 }, // F
    { key: "cuti", width: 6 }, // G
    { key: "izin", width: 6 }, // H
    { key: "sakit", width: 6 }, // I
    { key: "lembur", width: 6 }, // J
    { key: "project", width: 14 }, // K
    { key: "projectCode", width: 12 }, // L
    { key: "aipFitur", width: 10 }, // M
    { key: "kegiatan", width: 48 }, // N
  ];

  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: "thin", color: { argb: "FF000000" } },
    left: { style: "thin", color: { argb: "FF000000" } },
    bottom: { style: "thin", color: { argb: "FF000000" } },
    right: { style: "thin", color: { argb: "FF000000" } },
  };

  // Header row 1: "ABSENSI MANUAL" directly above vendor logo (Calibri 11)
  const row1 = worksheet.getRow(1);
  row1.height = 20;
  worksheet.mergeCells("A1:B1");
  const a1Cell = worksheet.getCell("A1");
  a1Cell.value = "ABSENSI MANUAL";
  a1Cell.font = { name: "Calibri", size: 11, bold: true };
  a1Cell.alignment = { horizontal: "center", vertical: "middle" };

  // Vendor Logo directly below "ABSENSI MANUAL" (starts at Row 2, across Col A & B)
  // Dimensions enlarged by 30%: 115x43 -> 150x56
  let hasImage = false;
  try {
    const vendorLogoPath = path.join(process.cwd(), "public", "vendors", `${vendor.id}-wide.png`);
    if (fs.existsSync(vendorLogoPath)) {
      const imgId = workbook.addImage({
        filename: vendorLogoPath,
        extension: "png",
      });
      worksheet.addImage(imgId, {
        tl: { col: 0.05, row: 1.05 },
        ext: { width: 150, height: 56 },
      });
      hasImage = true;
    }
  } catch (err) {
    console.warn("Could not load vendor logo for Excel export:", err);
  }

  if (!hasImage) {
    const fallbackTitle = worksheet.getCell("A2");
    fallbackTitle.value = vendor.shortName;
    fallbackTitle.font = { name: "Calibri", size: 14, bold: true, color: { argb: `FF${vendor.primaryColorHex}` } };
    const fallbackTagline = worksheet.getCell("A3");
    fallbackTagline.value = vendor.tagline;
    fallbackTagline.font = { name: "Calibri", size: 10, italic: true, bold: true, color: { argb: "FF444444" } };
  }

  // Profile Info Block directly beside the vendor logo (Rows 2 to 7, Col C & D) - Calibri 11
  const profileRows = [
    { label: "NAMA", val: data.profile.nama },
    { label: "NPP BNI", val: data.profile.npp },
    { label: "DIVISI", val: data.profile.divisi },
    { label: "DEPARTEMEN", val: data.profile.departemen },
    { label: "KELOMPOK", val: data.profile.kelompok },
    { label: "PERIODE", val: `${data.monthName} ${data.year}` },
  ];

  profileRows.forEach((item, idx) => {
    const rowNum = 2 + idx;
    const row = worksheet.getRow(rowNum);
    row.height = 18;

    const labelCell = row.getCell(3); // Col C
    labelCell.value = item.label;
    labelCell.font = { name: "Calibri", size: 11, bold: true };
    labelCell.alignment = { horizontal: "left", vertical: "middle" };

    const valCell = row.getCell(4); // Col D
    valCell.value = `: ${item.val}`;
    valCell.font = { name: "Calibri", size: 11, bold: true };
    valCell.alignment = { horizontal: "left", vertical: "middle" };
  });

  // Attendance Legend (Row 8) - Calibri 10
  const legendRow = worksheet.getRow(8);
  legendRow.height = 16;
  worksheet.mergeCells("F8:J8");
  const legendCell = worksheet.getCell("F8");
  legendCell.value = "H: Hadir C = Cuti  I = Izin   S = Sakit L = Lembur";
  legendCell.font = { name: "Calibri", size: 10, italic: true };
  legendCell.alignment = { horizontal: "center", vertical: "middle" };

  // Table Headers (Row 9 & 10) - Calibri 10
  const r9 = worksheet.getRow(9);
  const r10 = worksheet.getRow(10);

  r9.height = 18;
  r10.height = 18;

  worksheet.mergeCells("A9:A10");
  worksheet.getCell("A9").value = "No";

  worksheet.mergeCells("B9:B10");
  worksheet.getCell("B9").value = "Tanggal";

  worksheet.mergeCells("C9:C10");
  worksheet.getCell("C9").value = "Jam\nMasuk";

  worksheet.mergeCells("D9:D10");
  worksheet.getCell("D9").value = "Jam\nPulang";

  worksheet.mergeCells("E9:E10");
  worksheet.getCell("E9").value = "Total Jam\nKerja";

  worksheet.mergeCells("F9:J9");
  worksheet.getCell("F9").value = "Status Kehadiran";

  r10.getCell(6).value = "Hadir";
  r10.getCell(7).value = "Cuti";
  r10.getCell(8).value = "Izin";
  r10.getCell(9).value = "Sakit";
  r10.getCell(10).value = "Lembur";

  worksheet.mergeCells("K9:K10");
  worksheet.getCell("K9").value = "Project";

  worksheet.mergeCells("L9:L10");
  worksheet.getCell("L9").value = "Project Code";

  worksheet.mergeCells("M9:M10");
  worksheet.getCell("M9").value = "AIP Fitur";

  worksheet.mergeCells("N9:N10");
  worksheet.getCell("N9").value = "Kegiatan";

  // Style Header rows 9 & 10
  for (let r = 9; r <= 10; r++) {
    const row = worksheet.getRow(r);
    for (let c = 1; c <= 14; c++) {
      const cell = row.getCell(c);
      cell.font = { name: "Calibri", size: 10, bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.border = thinBorder;
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF2F2F2" },
      };
    }
  }

  // Data rows (Row 11 to 11 + days.length - 1) - Calibri 10
  let startRow = 11;
  let hadirCount = 0;
  let cutiCount = 0;
  let izinCount = 0;
  let sakitCount = 0;
  let lemburCount = 0;

  data.days.forEach((dayData) => {
    const row = worksheet.getRow(startRow);
    row.height = 20;

    const isWeekend = !!dayData.isWeekend;
    const isHoliday = !!dayData.isHoliday;
    const isWeekendOrHoliday = isWeekend || isHoliday;
    const isSick = dayData.statusKehadiran === "S" || dayData.kegiatan?.trim().toLowerCase() === "sick leave";

    // Values
    row.getCell(1).value = dayData.day;
    row.getCell(2).value = dayData.dateFormatted;
    row.getCell(3).value = dayData.jamMasuk || "";
    row.getCell(4).value = dayData.jamPulang || "";
    row.getCell(5).value = dayData.totalJamKerja || "";

    // Status columns
    const hVal = dayData.statusKehadiran === "H" ? "H" : "";
    const cVal = dayData.statusKehadiran === "C" ? "C" : "";
    const iVal = dayData.statusKehadiran === "I" ? "I" : "";
    const sVal = dayData.statusKehadiran === "S" ? "S" : "";
    const lVal = dayData.isLembur ? "L" : "";

    if (hVal) hadirCount++;
    if (cVal) cutiCount++;
    if (iVal) izinCount++;
    if (sVal) sakitCount++;
    if (lVal) lemburCount++;

    row.getCell(6).value = hVal;
    row.getCell(7).value = cVal;
    row.getCell(8).value = iVal;
    row.getCell(9).value = sVal;
    row.getCell(10).value = lVal;

    row.getCell(11).value = dayData.project || "";
    row.getCell(12).value = dayData.projectCode || "";
    row.getCell(13).value = dayData.aipFitur || "";
    row.getCell(14).value = dayData.kegiatan || "";

    // Determine row background fill
    let rowFill: ExcelJS.Fill | undefined = undefined;
    if (isSick) {
      // Entire row highlighted with pale yellow
      rowFill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFEB9C" }, // pale yellow
      };
    } else if (isWeekendOrHoliday) {
      // Weekend should be highlighted with light grey, even if user is overtime on that date
      rowFill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD9D9D9" }, // light grey
      };
    }

    // Cell formatting
    for (let c = 1; c <= 14; c++) {
      const cell = row.getCell(c);
      cell.border = thinBorder;
      cell.font = { name: "Calibri", size: 10 };

      // Alignments
      if (c === 1 || c === 2 || c === 3 || c === 4 || c === 5 || (c >= 6 && c <= 10)) {
        cell.alignment = { horizontal: "center", vertical: "middle" };
      } else if (c === 11 || c === 12 || c === 13) {
        cell.alignment = { horizontal: "center", vertical: "middle" };
      } else {
        cell.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
      }

      if (rowFill) {
        cell.fill = rowFill;
      }
    }

    startRow++;
  });

  // Summary Row (Jumlah) - Calibri 10 bold, merged D:E matching screenshot
  const sumRow = worksheet.getRow(startRow);
  sumRow.height = 20;
  worksheet.mergeCells(`D${startRow}:E${startRow}`);
  const jumlahCell = sumRow.getCell(4);
  jumlahCell.value = "Jumlah";
  jumlahCell.font = { name: "Calibri", size: 10, bold: true };
  jumlahCell.alignment = { horizontal: "center", vertical: "middle" };

  sumRow.getCell(6).value = hadirCount;
  sumRow.getCell(7).value = cutiCount;
  sumRow.getCell(8).value = izinCount;
  sumRow.getCell(9).value = sakitCount;
  sumRow.getCell(10).value = lemburCount;

  // Only border columns 4 to 10 (D to J), matching attached screenshot
  for (let c = 4; c <= 10; c++) {
    const cell = sumRow.getCell(c);
    cell.border = thinBorder;
    cell.font = { name: "Calibri", size: 10, bold: true };
    if (c >= 6 && c <= 10) {
      cell.alignment = { horizontal: "center", vertical: "middle" };
    }
  }

  // Spacing: 2 empty rows between Jumlah and Signature Block (as shown in attached image)
  const sigStart = startRow + 3;

  const boxes = [
    { startColLetter: "C", endColLetter: "E", title: "Pemohon", name: `Nama : ${data.profile.pemohonName}` },
    { startColLetter: "F", endColLetter: "J", title: "Diperiksa", name: `Nama : ${data.profile.diperiksaName}` },
    { startColLetter: "K", endColLetter: "M", title: "Disetujui,", name: `Nama : ${data.profile.disetujuiName}` },
  ];

  // 1. Signature Header Row (Calibri 11 bold)
  const sigHeaderRow = worksheet.getRow(sigStart);
  sigHeaderRow.height = 22;

  boxes.forEach((b) => {
    worksheet.mergeCells(`${b.startColLetter}${sigStart}:${b.endColLetter}${sigStart}`);
    const cell = worksheet.getCell(`${b.startColLetter}${sigStart}`);
    cell.value = b.title;
    cell.font = { name: "Calibri", size: 11, bold: true };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      top: thinBorder.top,
      bottom: thinBorder.bottom,
      left: thinBorder.left,
      right: thinBorder.right,
    };
  });

  // 2. Signature Empty Space Rows (5 rows of open space for signature, matching rows 46-50 in image)
  for (let r = 1; r <= 5; r++) {
    const rowNum = sigStart + r;
    const spaceRow = worksheet.getRow(rowNum);
    spaceRow.height = 18;

    boxes.forEach((b) => {
      worksheet.mergeCells(`${b.startColLetter}${rowNum}:${b.endColLetter}${rowNum}`);
      const cell = worksheet.getCell(`${b.startColLetter}${rowNum}`);
      cell.border = {
        left: thinBorder.left,
        right: thinBorder.right,
      };
    });
  }



  // 3. Names Row (Row 51 in screenshot) - Calibri 11
  const nameRowNum = sigStart + 6;
  const sigNameRow = worksheet.getRow(nameRowNum);
  sigNameRow.height = 22;

  boxes.forEach((b) => {
    worksheet.mergeCells(`${b.startColLetter}${nameRowNum}:${b.endColLetter}${nameRowNum}`);
    const cell = worksheet.getCell(`${b.startColLetter}${nameRowNum}`);
    cell.value = b.name;
    cell.font = { name: "Calibri", size: 11 };
    cell.alignment = { horizontal: "left", vertical: "middle" };
    cell.border = {
      top: thinBorder.top,
      bottom: thinBorder.bottom,
      left: thinBorder.left,
      right: thinBorder.right,
    };
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
