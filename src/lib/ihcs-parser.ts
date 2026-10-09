import { extractTextItems, extractText } from "unpdf";

export interface IhcsParsedDay {
  day: number;
  checkIn: string; // "08:03"
  checkOut: string; // "23:53"
  checkInRaw?: string;
  checkOutRaw?: string;
  statusKehadiran: string; // "H" | "S" | "C" | "I" | ""
  kegiatan: string;
  rawKet: string;
}

export interface IhcsParseResult {
  employeeName: string;
  employeeNpp: string;
  unit: string;
  detectedYear: number;
  detectedMonth: number; // 1-12
  days: IhcsParsedDay[];
}

const MONTH_NAMES: Record<string, number> = {
  januari: 1,
  january: 1,
  februari: 2,
  february: 2,
  maret: 3,
  march: 3,
  april: 4,
  mei: 5,
  may: 5,
  juni: 6,
  june: 6,
  juli: 7,
  july: 7,
  agustus: 8,
  august: 8,
  september: 9,
  oktober: 10,
  october: 10,
  november: 11,
  desember: 12,
  december: 12,
};

export function mapIhcsKetToAttendance(rawKet?: string): { status: string; kegiatan: string } {
  const code = (rawKet || "").toUpperCase().trim();
  switch (code) {
    case "H":
    case "T":
      return { status: "H", kegiatan: "" };
    case "LIB":
    case "HI":
    case "LF":
      return { status: "", kegiatan: "" };
    case "S":
    case "SK1":
      return { status: "S", kegiatan: "Sakit" };
    case "SK2":
      return { status: "S", kegiatan: "Sakit Opname" };
    case "SK3":
      return { status: "S", kegiatan: "Sakit Khusus" };
    case "CB":
      return { status: "C", kegiatan: "Cuti Besar" };
    case "CH":
      return { status: "C", kegiatan: "Cuti Haid" };
    case "CLT":
      return { status: "C", kegiatan: "Cuti Diluar Tanggungan" };
    case "CT1":
    case "CT2":
    case "CTT":
    case "PCT":
      return { status: "C", kegiatan: "Cuti Tahunan" };
    case "P":
    case "PF":
      return { status: "I", kegiatan: "Permisi / Izin" };
    case "DP":
      return { status: "I", kegiatan: "Dispensasi" };
    case "D":
    case "D1":
      return { status: "H", kegiatan: "Dinas Luar / Dalam Kota" };
    case "PB":
      return { status: "H", kegiatan: "Pelatihan & Training" };
    default:
      return { status: code === "H" ? "H" : "", kegiatan: "" };
  }
}

/**
 * Parses an IHCS "Laporan Kehadiran Karyawan" PDF document buffer.
 * Uses worker-free unpdf to guarantee compatibility with Next.js App Router and serverless.
 */
export async function parseIhcsPdf(
  buffer: Buffer | Uint8Array | ArrayBuffer
): Promise<IhcsParseResult> {
  let uint8: Uint8Array;
  if (buffer instanceof ArrayBuffer) {
    uint8 = new Uint8Array(buffer);
  } else if (typeof Buffer !== "undefined" && Buffer.isBuffer(buffer)) {
    uint8 = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  } else if (buffer instanceof Uint8Array) {
    uint8 = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  } else {
    uint8 = new Uint8Array(buffer as any);
  }

  // Extract all text items with precise (x, y) coordinates
  const textItemsResult = await extractTextItems(uint8);
  const items = ((textItemsResult?.items as any[]) || []).flat().filter(
    (it) => it && typeof it.str === "string" && it.str.trim()
  );

  let detectedYear = new Date().getFullYear();
  let detectedMonth = new Date().getMonth() + 1;
  let employeeName = "";
  let employeeNpp = "";
  let unit = "";

  // 1. Extract metadata from top area (y >= 700)
  for (const it of items) {
    const str = it.str.trim();
    if (it.y >= 700) {
      if (/OM\d+/i.test(str)) {
        const match = str.match(/OM\d+/i);
        if (match && !employeeNpp) employeeNpp = match[0];
      }
      if (str.includes("Departemen") || str.includes("Retail")) {
        unit = str.replace(/Unit\s*:\s*/i, "").trim();
      }
      if (
        /^[A-Z\s]{4,}$/.test(str) &&
        !str.includes("LAPORAN") &&
        !str.includes("KEHADIRAN") &&
        !str.includes("KARYAWAN") &&
        !str.includes("NPP") &&
        !str.includes("NAMA") &&
        !str.includes("UNIT") &&
        !str.includes("TIME") &&
        !str.includes("ZONE") &&
        !str.includes("WIB") &&
        !str.includes("WORK") &&
        !str.includes("TIPE")
      ) {
        if (!employeeName) employeeName = str;
      }
    }
  }

  // Fallback for metadata from general text if top items didn't match
  if (!employeeName || !employeeNpp) {
    const { text } = await extractText(uint8);
    const fullText = Array.isArray(text) ? text.join("\n") : text;
    const nppMatch = fullText.match(/OM\d+/i);
    if (nppMatch && !employeeNpp) employeeNpp = nppMatch[0];

    const nameMatch = fullText.match(/(?:OM\d+\s*[-/]?\s*|Nama\s*:\s*)([A-Z\s]{4,})/i);
    if (nameMatch && !employeeName) employeeName = nameMatch[1].trim();
  }

  // 2. Extract date rows using coordinate matching
  // Look for date pattern like "01 September 2026"
  const dateItems = items.filter((i) =>
    /^\d{1,2}\s+[A-Za-z]+\s+\d{4}$/.test(i.str.trim())
  );

  const days: IhcsParsedDay[] = [];
  const seenDays = new Set<number>();

  for (const dItem of dateItems) {
    const dateStr = dItem.str.trim();
    const parts = dateStr.split(/\s+/);
    const dayNum = parseInt(parts[0], 10);
    const mStr = parts[1].toLowerCase();
    const yr = parseInt(parts[2], 10);
    const mNum = MONTH_NAMES[mStr];

    if (!mNum || isNaN(dayNum)) continue;

    if (days.length === 0) {
      detectedYear = yr;
      detectedMonth = mNum;
    }

    if (seenDays.has(dayNum)) continue;
    seenDays.add(dayNum);

    // Find all items on this row (y within 4px of date item)
    const rowY = dItem.y;
    const rowItems = items.filter((it) => Math.abs(it.y - rowY) <= 4);

    // Columns by known x-coordinate positions:
    // Check-In: x in [320, 390]
    // Check-Out: x in [390, 460]
    // Ket: x in [520, 580]
    const checkInItem = rowItems.find(
      (it) => it.x >= 320 && it.x < 390 && it.str.trim() && it.str.trim() !== "-"
    );
    const checkOutItem = rowItems.find(
      (it) => it.x >= 390 && it.x < 460 && it.str.trim() && it.str.trim() !== "-"
    );
    const ketItem = rowItems.find(
      (it) => it.x >= 520 && it.x < 580 && it.str.trim() && it.str.trim() !== "-"
    );

    const checkInRaw = checkInItem?.str?.trim() || "";
    const checkOutRaw = checkOutItem?.str?.trim() || "";
    const rawKet = ketItem?.str?.trim() || "";

    const checkIn = checkInRaw ? checkInRaw.slice(0, 5) : "";
    const checkOut = checkOutRaw ? checkOutRaw.slice(0, 5) : "";

    const mapped = mapIhcsKetToAttendance(rawKet);
    let finalStatus = mapped.status;
    if (!finalStatus && checkIn) {
      finalStatus = "H";
    }

    days.push({
      day: dayNum,
      checkIn,
      checkOut,
      checkInRaw,
      checkOutRaw,
      statusKehadiran: finalStatus,
      kegiatan: mapped.kegiatan,
      rawKet,
    });
  }

  days.sort((a, b) => a.day - b.day);

  return {
    employeeName,
    employeeNpp,
    unit,
    detectedYear,
    detectedMonth,
    days,
  };
}
