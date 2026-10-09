"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Flame,
  Building2,
  User,
  Sparkles,
} from "lucide-react";
import { DayRecord } from "./TimesheetTable";
import { IhcsParseResult } from "@/lib/ihcs-parser";
import { calculateWorkHoursAndOvertime, getIndonesianMonthName } from "@/lib/time-calc";

interface IhcsImportModalProps {
  isOpen: boolean;
  initialFile?: File | null;
  currentYear: number;
  currentMonth: number;
  existingDays: DayRecord[];
  standardIn: string;
  standardOut: string;
  defaultProject: string;
  onClose: () => void;
  onApplyImport: (
    importedDays: DayRecord[],
    targetYear: number,
    targetMonth: number
  ) => void;
}

export const IhcsImportModal: React.FC<IhcsImportModalProps> = ({
  isOpen,
  initialFile,
  currentYear,
  currentMonth,
  existingDays,
  standardIn,
  standardOut,
  defaultProject,
  onClose,
  onApplyImport,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [parseResult, setParseResult] = useState<IhcsParseResult | null>(null);

  // Import options
  const [autoCalculateHours, setAutoCalculateHours] = useState(true);
  const [fillDefaultProject, setFillDefaultProject] = useState(true);
  const [overwriteExisting, setOverwriteExisting] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleReset = () => {
    setFile(null);
    setParseResult(null);
    setErrorMsg(null);
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const processFile = async (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith(".pdf")) {
      setErrorMsg("Harap pilih file dokumen berformat PDF (.pdf).");
      return;
    }

    setFile(selectedFile);
    setErrorMsg(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/timesheet/import-ihcs", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal memproses file PDF.");
      }

      setParseResult(json.data);
    } catch (err: any) {
      console.error("PDF upload error:", err);
      setErrorMsg(err.message || "Terjadi kesalahan saat memproses file PDF.");
      setParseResult(null);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (isOpen && initialFile) {
      processFile(initialFile);
    }
  }, [isOpen, initialFile]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      processFile(selected);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleApply = () => {
    if (!parseResult) return;

    const targetYear = parseResult.detectedYear;
    const targetMonth = parseResult.detectedMonth;

    // Build or merge days
    const isSameMonth = targetYear === currentYear && targetMonth === currentMonth;

    // Use current month days if matching, or generate standard days if switching month
    let baseDays: DayRecord[] = [];
    if (isSameMonth && existingDays.length > 0) {
      baseDays = [...existingDays];
    } else {
      // Build skeleton days for target month
      const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(targetYear, targetMonth - 1, d);
        const dayOfWeek = dateObj.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const dateStr = `${targetYear}-${String(targetMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

        baseDays.push({
          id: `ihcs-imported-${d}-${Date.now()}`,
          day: d,
          dateStr,
          dayName: dayNames[dayOfWeek],
          isWeekend,
          isHoliday: false,
          holidayName: null,
          jamMasuk: "",
          jamPulang: "",
          totalJamKerja: "",
          totalMinutes: 0,
          statusKehadiran: "",
          isLembur: false,
          project: !isWeekend ? defaultProject || "Collection" : "",
          projectCode: "",
          aipFitur: "",
          kegiatan: "",
        });
      }
    }

    // Map each parsed day into baseDays
    const updatedDays = baseDays.map((dayItem) => {
      const match = parseResult.days.find((pd) => pd.day === dayItem.day);
      if (!match) return dayItem;

      if (!overwriteExisting && (dayItem.jamMasuk || dayItem.jamPulang || dayItem.statusKehadiran)) {
        return dayItem;
      }

      const jamMasuk = match.checkIn || "";
      const jamPulang = match.checkOut || "";
      const statusKehadiran = match.statusKehadiran || "";
      const kegiatan = match.kegiatan || dayItem.kegiatan || "";

      let totalJamKerja = "";
      let totalMinutes = 0;
      let isLembur = false;

      if (autoCalculateHours && jamMasuk && jamPulang) {
        const calc = calculateWorkHoursAndOvertime(
          jamMasuk,
          jamPulang,
          dayItem.isWeekend,
          dayItem.isHoliday,
          standardIn || "08:30",
          standardOut || "17:00"
        );
        totalJamKerja = calc.formattedTotal;
        totalMinutes = calc.totalMinutes;
        isLembur = calc.isOvertime;
      }

      let project = dayItem.project;
      if (fillDefaultProject && !project && !dayItem.isWeekend && !dayItem.isHoliday) {
        project = defaultProject || "Collection";
      }

      return {
        ...dayItem,
        jamMasuk,
        jamPulang,
        totalJamKerja,
        totalMinutes,
        isLembur,
        statusKehadiran: statusKehadiran || dayItem.statusKehadiran,
        kegiatan: kegiatan || (isLembur ? "Support UAT & Deploy" : dayItem.kegiatan),
        project,
      };
    });

    onApplyImport(updatedDays, targetYear, targetMonth);
    handleReset();
    onClose();
  };

  const isPeriodDifferent =
    parseResult &&
    (parseResult.detectedYear !== currentYear || parseResult.detectedMonth !== currentMonth);

  const checkInCount = parseResult?.days.filter((d) => d.checkIn).length || 0;
  const checkOutCount = parseResult?.days.filter((d) => d.checkOut).length || 0;
  const lemburCount =
    parseResult?.days.filter((d) => {
      if (!d.checkIn || !d.checkOut) return false;
      const calc = calculateWorkHoursAndOvertime(
        d.checkIn,
        d.checkOut,
        false,
        false,
        standardIn || "08:30",
        standardOut || "17:00"
      );
      return calc.isOvertime;
    }).length || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/90 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 shadow-2xs">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                Import Laporan Kehadiran IHCS (PDF)
              </h3>
              <p className="text-xs text-slate-500">
                Otomatis membaca & mengisi <strong>Jam Check-In</strong> dan <strong>Jam Check-Out</strong> dari portal BNI IHCS
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* If no result yet: Upload Zone */}
          {!parseResult && (
            <div className="space-y-4">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition ${
                  isUploading
                    ? "border-blue-400 bg-blue-50/40"
                    : "border-slate-300 bg-slate-50/50 hover:border-blue-500 hover:bg-blue-50/20"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {isUploading ? (
                  <div className="flex flex-col items-center gap-3 py-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        Membaca File PDF IHCS...
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Mengekstrak tanggal, jam check-in, dan jam check-out otomatis
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-3 shadow-xs">
                      <Upload className="h-7 w-7" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">
                      Pilih atau Seret File PDF Laporan Kehadiran IHCS
                    </p>
                    <p className="text-xs text-slate-500 mt-1 max-w-md">
                      Sistem akan otomatis membaca <strong>Jam Check In</strong> dan <strong>Jam Check Out</strong> setiap tanggal untuk mengisi timesheet Anda secara akurat.
                    </p>
                  </>
                )}
              </div>

              {errorMsg && (
                <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800 animate-in fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                  <div>
                    <span className="font-bold">Gagal memproses file:</span> {errorMsg}
                  </div>
                </div>
              )}

              {/* Informative tips */}
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 text-xs text-slate-600 space-y-1.5">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                  Keunggulan Otomatisasi:
                </span>
                <ul className="list-disc pl-5 space-y-1 text-slate-500">
                  <li><strong>Jam Check In & Jam Check Out</strong> langsung terbaca dan dimasukkan ke form timesheet per tanggal.</li>
                  <li>Otomatis menghitung total jam kerja dan mendeteksi lembur (hari kerja maupun akhir pekan).</li>
                  <li>Otomatis mendeteksi status Hadir (H), Terlambat (T), Sakit (SK2), Permisi (P), Cuti (CT), dan Libur (LIB).</li>
                </ul>
              </div>
            </div>
          )}

          {/* If parsed: Show Preview */}
          {parseResult && (
            <div className="space-y-4 animate-in fade-in">
              {/* Document Metadata Card */}
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 p-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-900">
                      {parseResult.employeeNpp || "Pegawai"} — {parseResult.employeeName || "-"}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md">
                    {getIndonesianMonthName(parseResult.detectedMonth - 1)} {parseResult.detectedYear}
                  </span>
                </div>

                {parseResult.unit && (
                  <p className="text-[11px] text-slate-600 mt-2 flex items-center gap-1.5 truncate">
                    <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{parseResult.unit}</span>
                  </p>
                )}

                {/* Summary Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-200/70">
                  <div className="rounded-lg bg-white border border-slate-200/80 p-2 text-center shadow-2xs">
                    <span className="block text-[10px] text-emerald-600 font-semibold">Check-In Terdeteksi</span>
                    <span className="text-xs font-extrabold text-emerald-800">{checkInCount} hari</span>
                  </div>
                  <div className="rounded-lg bg-white border border-slate-200/80 p-2 text-center shadow-2xs">
                    <span className="block text-[10px] text-blue-600 font-semibold">Check-Out Terdeteksi</span>
                    <span className="text-xs font-extrabold text-blue-800">{checkOutCount} hari</span>
                  </div>
                  <div className="rounded-lg bg-white border border-slate-200/80 p-2 text-center shadow-2xs">
                    <span className="block text-[10px] text-orange-600 font-semibold">Hari Lembur</span>
                    <span className="text-xs font-extrabold text-orange-800">{lemburCount} hari</span>
                  </div>
                  <div className="rounded-lg bg-white border border-slate-200/80 p-2 text-center shadow-2xs">
                    <span className="block text-[10px] text-slate-500 font-semibold">Total Hari Laporan</span>
                    <span className="text-xs font-extrabold text-slate-800">{parseResult.days.length} hari</span>
                  </div>
                </div>
              </div>

              {/* Notice if period differs from current view */}
              {isPeriodDifferent && (
                <div className="flex items-center gap-2.5 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                  <div>
                    Periode file ({getIndonesianMonthName(parseResult.detectedMonth - 1)} {parseResult.detectedYear}) berbeda dengan tampilan kalender saat ini ({getIndonesianMonthName(currentMonth - 1)} {currentYear}).
                    Tampilan akan otomatis dialihkan ke periode file tersebut saat diterapkan.
                  </div>
                </div>
              )}

              {/* Options */}
              <div className="rounded-xl border border-slate-200 p-3.5 bg-white space-y-2.5">
                <span className="text-xs font-bold text-slate-800 block">Opsi Penerapan:</span>
                <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoCalculateHours}
                    onChange={(e) => setAutoCalculateHours(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Otomatis hitung total jam kerja & status lembur (overtime)</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fillDefaultProject}
                    onChange={(e) => setFillDefaultProject(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Isi nama proyek default ({defaultProject || "Collection"}) untuk hari kerja</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={overwriteExisting}
                    onChange={(e) => setOverwriteExisting(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Perbarui / timpa data jam yang sudah ada sebelumnya</span>
                </label>
              </div>

              {/* Table Preview with Explicit Check-In and Check-Out Columns */}
              <div className="rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="bg-slate-100 px-3.5 py-2 text-[11px] font-bold text-slate-600 uppercase tracking-wider grid grid-cols-12 gap-2 border-b border-slate-200">
                  <span className="col-span-4">Tanggal & Status</span>
                  <span className="col-span-3 text-center">Check-In</span>
                  <span className="col-span-3 text-center">Check-Out</span>
                  <span className="col-span-2 text-center">Jam Kerja</span>
                </div>
                <div className="max-h-52 overflow-y-auto divide-y divide-slate-100 text-xs bg-white">
                  {parseResult.days.map((d) => {
                    const calc =
                      d.checkIn && d.checkOut
                        ? calculateWorkHoursAndOvertime(
                            d.checkIn,
                            d.checkOut,
                            false,
                            false,
                            standardIn || "08:30",
                            standardOut || "17:00"
                          )
                        : null;

                    return (
                      <div
                        key={d.day}
                        className="grid grid-cols-12 gap-2 items-center px-3.5 py-1.5 hover:bg-slate-50 transition"
                      >
                        <div className="col-span-4 flex items-center gap-1.5 min-w-0">
                          <span className="font-mono font-bold text-slate-800 w-11 shrink-0">Tgl {d.day}</span>
                          <span
                            className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                              d.statusKehadiran === "H"
                                ? "bg-emerald-100 text-emerald-800"
                                : d.statusKehadiran === "S"
                                ? "bg-rose-100 text-rose-800"
                                : d.statusKehadiran === "I"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {d.rawKet || d.statusKehadiran || "LIB"}
                          </span>
                        </div>
                        <div className="col-span-3 text-center">
                          {d.checkIn ? (
                            <span className="inline-block font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80 text-[11px]">
                              {d.checkIn}
                            </span>
                          ) : (
                            <span className="text-slate-300 font-mono text-[11px]">-</span>
                          )}
                        </div>
                        <div className="col-span-3 text-center">
                          {d.checkOut ? (
                            <span className="inline-block font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/80 text-[11px]">
                              {d.checkOut}
                            </span>
                          ) : (
                            <span className="text-slate-300 font-mono text-[11px]">-</span>
                          )}
                        </div>
                        <div className="col-span-2 text-center">
                          {calc ? (
                            <div className="flex flex-col items-center">
                              <span className="font-mono text-[11px] font-semibold text-slate-700">
                                {calc.formattedTotal}
                              </span>
                              {calc.isOvertime && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-orange-700 bg-orange-100 px-1 rounded">
                                  <Flame className="h-2.5 w-2.5 text-orange-600" /> Lembur
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-300 font-mono text-[11px]">-</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
          {parseResult ? (
            <button
              type="button"
              onClick={handleReset}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              Ganti File
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                handleReset();
                onClose();
              }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              Batal
            </button>
            {parseResult && (
              <button
                type="button"
                onClick={handleApply}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-600/25 hover:bg-blue-700 transition cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Set Waktu Check-In & Check-Out ({parseResult.days.filter((d) => d.checkIn || d.checkOut || d.statusKehadiran).length} Hari)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
