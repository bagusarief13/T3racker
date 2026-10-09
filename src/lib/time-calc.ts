/**
 * Helper utilities for working hours and overtime calculation
 */

export interface TimeCalcResult {
  totalMinutes: number;
  formattedTotal: string; // "13:17"
  isOvertime: boolean;
  attendanceStatus: string;
}

/**
 * Normalizes any time input or pasted text into standard "HH:mm" format.
 * Returns null if input cannot be parsed into a valid time.
 */
export function normalizeTimeString(input?: string | null): string | null {
  if (!input) return null;
  const str = input.trim();
  if (!str) return null;

  // 1. Check for 12-hour format with AM/PM (e.g. "08:09:31 AM", "8:30 PM", "8.30pm")
  const ampmMatch = str.match(/(\d{1,2})[:.](\d{1,2})(?:[:.]\d{1,2})?\s*(am|pm)/i);
  if (ampmMatch) {
    let h = parseInt(ampmMatch[1], 10);
    const m = parseInt(ampmMatch[2], 10);
    const isPm = ampmMatch[3].toLowerCase() === "pm";
    if (isPm && h < 12) h += 12;
    if (!isPm && h === 12) h = 0;
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    }
  }

  // 2. Check for ISO or timestamp containing time (e.g. "2026-10-09T08:09:31", "2026-10-09 08:09:31")
  const isoMatch = str.match(/(?:T|\s)(\d{1,2})[:.](\d{1,2})(?:[:.](\d{1,2}))?/);
  if (isoMatch) {
    const h = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10);
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    }
  }

  // 3. Exact time with separators: HH:mm:ss, H:m:s, HH.mm.ss, HH:mm, H:m, HH.mm
  // e.g. "08:09:31", "8:9:31", "08.09.31", "08:30", "8:30", "08.30", "8.30", "8:3", "22:0"
  const sepMatch = str.match(/^(\d{1,2})[:.](\d{1,2})(?:[:.](\d{1,2}))?$/);
  if (sepMatch) {
    const h = parseInt(sepMatch[1], 10);
    const mStr = sepMatch[2];
    let m = parseInt(mStr, 10);
    // If single digit minute e.g. "8:3" -> assume "8:30" if m <= 5 and length is 1
    if (mStr.length === 1 && m <= 5) {
      m = m * 10;
    }
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    }
  }

  // 4. Digits-only formats (e.g. "2200", "0830", "830", "080931")
  const digitsOnly = str.replace(/\D/g, "");
  // HHmmss e.g. 080931 -> 08:09
  if (digitsOnly.length === 6 && str.length <= 8) {
    const h = parseInt(digitsOnly.slice(0, 2), 10);
    const m = parseInt(digitsOnly.slice(2, 4), 10);
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    }
  }

  // HHmm e.g. 2200 -> 22:00, 0830 -> 08:30
  if (digitsOnly.length === 4 && (str.length === 4 || /^\d{4}$/.test(str))) {
    const h = parseInt(digitsOnly.slice(0, 2), 10);
    const m = parseInt(digitsOnly.slice(2, 4), 10);
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    }
  }

  // Hmm e.g. 830 -> 08:30, 915 -> 09:15, 746 -> 07:46
  if (digitsOnly.length === 3 && /^\d{3}$/.test(str)) {
    const h = parseInt(digitsOnly.slice(0, 1), 10);
    const m = parseInt(digitsOnly.slice(1, 3), 10);
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    }
  }

  // 1 or 2 digits e.g. "8" -> "08:00", "22" -> "22:00"
  if ((digitsOnly.length === 1 || digitsOnly.length === 2) && /^\d{1,2}$/.test(str)) {
    const h = parseInt(digitsOnly, 10);
    if (h >= 0 && h <= 23) {
      return `${h.toString().padStart(2, "0")}:00`;
    }
  }

  // 5. Single digit hour with colon e.g. "08:" or "8:"
  const hourOnlyMatch = str.match(/^(\d{1,2}):$/);
  if (hourOnlyMatch) {
    const h = parseInt(hourOnlyMatch[1], 10);
    if (h >= 0 && h <= 23) {
      return `${h.toString().padStart(2, "0")}:00`;
    }
  }

  // 6. Look for any substring matching HH:mm:ss or HH:mm in messy pasted text
  // e.g. "Pukul 08:09:31 WIB" or "[08:09:31]" or "Check-in: 08:30"
  const substrMatch = str.match(/(\d{1,2})[:.](\d{2})(?:[:.](\d{2}))?/);
  if (substrMatch) {
    const h = parseInt(substrMatch[1], 10);
    const m = parseInt(substrMatch[2], 10);
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    }
  }

  return null;
}

/**
 * Parse time string "HH:mm" into total minutes from midnight
 */
export function timeToMinutes(timeStr?: string | null): number | null {
  if (!timeStr || !timeStr.trim()) return null;
  const normalized = normalizeTimeString(timeStr) || timeStr.trim();
  const parts = normalized.split(":");
  if (parts.length < 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}

/**
 * Format minutes into "H:mm" or "HH:mm"
 */
export function minutesToHHmm(minutes: number): string {
  if (minutes <= 0) return "0:00";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
}

/**
 * Calculate total working hours and overtime status
 * @param checkIn - "07:48"
 * @param checkOut - "21:05"
 * @param isWeekend - boolean
 * @param isHoliday - boolean
 * @param standardIn - default "08:30"
 * @param standardOut - default "17:00"
 */
export function calculateWorkHoursAndOvertime(
  checkIn?: string | null,
  checkOut?: string | null,
  isWeekend: boolean = false,
  isHoliday: boolean = false,
  standardIn: string = "08:30",
  standardOut: string = "17:00"
): TimeCalcResult {
  const inMin = timeToMinutes(checkIn);
  const outMin = timeToMinutes(checkOut);

  if (inMin === null || outMin === null) {
    return {
      totalMinutes: 0,
      formattedTotal: "",
      isOvertime: false,
      attendanceStatus: "",
    };
  }

  // Calculate duration
  let duration = outMin - inMin;
  if (duration < 0) {
    // Over midnight shift e.g. 23:00 to 07:00
    duration += 24 * 60;
  }

  const formattedTotal = minutesToHHmm(duration);

  // Standard duration: e.g. 08:30 to 17:00 = 8.5 hours = 510 minutes
  const stdInMin = timeToMinutes(standardIn) ?? 510;
  const stdOutMin = timeToMinutes(standardOut) ?? 1020;
  let stdDuration = stdOutMin - stdInMin;
  if (stdDuration <= 0) stdDuration = 510;

  let isOvertime = false;

  if (isWeekend || isHoliday) {
    // Weekend / Holiday rule: 8 hours minimum (480 minutes)
    if (duration >= 8 * 60) {
      isOvertime = true;
    }
  } else {
    // Workday rule: realized time is +3 hours minimum over standard duration (std + 180 min)
    // OR worked at least 3 hours past standard checkout (outMin >= stdOutMin + 180 min = 20:00)
    const thresholdMinutes = stdDuration + 3 * 60; // e.g. 510 + 180 = 690 mins (11h 30m)
    const checkoutPastThreshold = outMin >= (stdOutMin + 3 * 60);

    if (duration >= thresholdMinutes || checkoutPastThreshold) {
      isOvertime = true;
    }
  }

  return {
    totalMinutes: duration,
    formattedTotal,
    isOvertime,
    attendanceStatus: "H",
  };
}

/**
 * Format day of week to Indonesian name
 */
export function getIndonesianDayName(date: Date): string {
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  return days[date.getDay()];
}

/**
 * Format month to Indonesian name
 */
export function getIndonesianMonthName(monthIndex: number): string {
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  return months[monthIndex];
}

/**
 * Format date for table display e.g. "3-Aug-26"
 */
export function formatTableDate(date: Date): string {
  const monthsShort = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const d = date.getDate();
  const m = monthsShort[date.getMonth()];
  const y = date.getFullYear().toString().slice(-2);
  return `${d}-${m}-${y}`;
}
