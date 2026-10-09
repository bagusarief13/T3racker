export interface HolidayItem {
  date: string; // YYYY-MM-DD
  name: string;
  isCutiBersama?: boolean;
}

// Built-in Indonesian National Holidays & Cuti Bersama with focus on 2025 - 2027
export const INDONESIA_HOLIDAYS: Record<string, string> = {
  // 2025
  "2025-01-01": "Tahun Baru 2025 Masehi",
  "2025-01-27": "Isra Mi'raj Nabi Muhammad SAW",
  "2025-01-29": "Tahun Baru Imlek 2576 Kongzili",
  "2025-03-29": "Hari Suci Nyepi (Tahun Baru Saka 1947)",
  "2025-03-31": "Hari Raya Idul Fitri 1446 H",
  "2025-04-01": "Hari Raya Idul Fitri 1446 H",
  "2025-04-18": "Wafat Yesus Kristus",
  "2025-04-20": "Hari Paskah",
  "2025-05-01": "Hari Buruh Internasional",
  "2025-05-12": "Hari Raya Waisak 2569 BE",
  "2025-05-29": "Kenaikan Yesus Kristus",
  "2025-06-01": "Hari Lahir Pancasila",
  "2025-06-07": "Hari Raya Idul Adha 1446 H",
  "2025-06-27": "Tahun Baru Islam 1447 H",
  "2025-08-17": "HUT Proklamasi Kemerdekaan RI",
  "2025-09-05": "Maulid Nabi Muhammad SAW",
  "2025-12-25": "Hari Raya Natal",

  // 2026 (matches the user's document!)
  "2026-01-01": "Tahun Baru 2026 Masehi",
  "2026-01-16": "Isra Mi'raj Nabi Muhammad SAW",
  "2026-02-17": "Tahun Baru Imlek 2577 Kongzili",
  "2026-03-19": "Hari Suci Nyepi (Tahun Baru Saka 1948)",
  "2026-03-20": "Hari Raya Idul Fitri 1447 H",
  "2026-03-21": "Hari Raya Idul Fitri 1447 H",
  "2026-04-03": "Wafat Yesus Kristus",
  "2026-04-05": "Hari Paskah",
  "2026-05-01": "Hari Buruh Internasional",
  "2026-05-14": "Kenaikan Yesus Kristus",
  "2026-05-31": "Hari Raya Waisak 2570 BE",
  "2026-06-01": "Hari Lahir Pancasila",
  "2026-05-27": "Hari Raya Idul Adha 1447 H",
  "2026-06-16": "Tahun Baru Islam 1448 H",
  "2026-08-17": "HUT Republik Indonesia",
  "2026-08-25": "Maulid Nabi Muhammad SAW",
  "2026-12-25": "Hari Raya Natal",

  // 2027
  "2027-01-01": "Tahun Baru 2027 Masehi",
  "2027-01-06": "Isra Mi'raj Nabi Muhammad SAW",
  "2027-02-06": "Tahun Baru Imlek 2578 Kongzili",
  "2027-03-09": "Hari Raya Idul Fitri 1448 H",
  "2027-03-10": "Hari Raya Idul Fitri 1448 H",
  "2027-03-26": "Wafat Yesus Kristus",
  "2027-05-01": "Hari Buruh Internasional",
  "2027-05-06": "Kenaikan Yesus Kristus",
  "2027-05-16": "Hari Raya Idul Adha 1448 H",
  "2027-05-20": "Hari Raya Waisak 2571 BE",
  "2027-06-01": "Hari Lahir Pancasila",
  "2027-06-06": "Tahun Baru Islam 1449 H",
  "2027-08-17": "HUT Republik Indonesia",
  "2027-08-15": "Maulid Nabi Muhammad SAW",
  "2027-12-25": "Hari Raya Natal",
};

/**
 * Fetch holidays for a specific year from API, falling back to local dataset
 */
export async function getIndonesianHolidays(year: number): Promise<Record<string, string>> {
  const result: Record<string, string> = {};

  // First seed from local dataset
  for (const [date, name] of Object.entries(INDONESIA_HOLIDAYS)) {
    if (date.startsWith(`${year}-`)) {
      result[date] = name;
    }
  }

  // Attempt to fetch from external API with timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(`https://daysoff.id/api?year=${year}`, {
      signal: controller.signal,
      next: { revalidate: 86400 }, // cache for 24h
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        for (const item of data) {
          if (item.is_holiday || item.is_national_holiday) {
            // format YYYY-MM-DD
            result[item.date] = item.name || item.description || "Hari Libur Nasional";
          }
        }
      }
    }
  } catch {
    // Gracefully ignore network errors and use built-in dataset
  }

  return result;
}

/**
 * Get holiday name for a given date if any
 */
export function checkIsHoliday(
  dateStr: string,
  customOverrides: Record<string, { name: string; isHoliday: boolean }> = {}
): { isHoliday: boolean; holidayName: string } {
  // 1. Check user custom overrides first
  if (customOverrides[dateStr] !== undefined) {
    const override = customOverrides[dateStr];
    return {
      isHoliday: override.isHoliday,
      holidayName: override.name || "",
    };
  }

  // 2. Check built-in holidays
  if (INDONESIA_HOLIDAYS[dateStr]) {
    return {
      isHoliday: true,
      holidayName: INDONESIA_HOLIDAYS[dateStr],
    };
  }

  return { isHoliday: false, holidayName: "" };
}
