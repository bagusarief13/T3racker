"use client";

import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  Flame,
  Plus,
  Download,
  Upload,
  FileSpreadsheet,
  FileText,
  Building2,
} from "lucide-react";
import { DayRecord } from "./TimesheetTable";
import { getIndonesianMonthName, calculateWorkHoursAndOvertime } from "@/lib/time-calc";
import { getVendorById } from "@/lib/vendors";

interface TimesheetCalendarProps {
  days: DayRecord[];
  year: number;
  month: number;
  defaultProject: string;
  standardIn: string;
  standardOut: string;
  vendorId?: string;
  isSaving: boolean;
  onUpdateDays: (updatedDays: DayRecord[]) => void;
  onOpenDayModal: (day: DayRecord) => void;
  onExportExcel: () => void;
  onExportSddDocx: () => void;
  onExportBniDocx: () => void;
  onOpenImportModal?: () => void;
}

export const TimesheetCalendar: React.FC<TimesheetCalendarProps> = ({
  days,
  year,
  month,
  defaultProject,
  standardIn,
  standardOut,
  vendorId,
  isSaving,
  onUpdateDays,
  onOpenDayModal,
  onExportExcel,
  onExportSddDocx,
  onExportBniDocx,
  onOpenImportModal,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const activeVendor = getVendorById(vendorId);

  // Day columns (Indonesian business week starts on Monday)
  const weekDays = [
    { label: "Senin", isWeekend: false },
    { label: "Selasa", isWeekend: false },
    { label: "Rabu", isWeekend: false },
    { label: "Kamis", isWeekend: false },
    { label: "Jumat", isWeekend: false },
    { label: "Sabtu", isWeekend: true },
    { label: "Minggu", isWeekend: true },
  ];

  // Calculate calendar grid math
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay(); // 0 is Sunday, 1 is Monday...
  // In Monday-first index: Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6
  const leadingOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  // Previous month trailing days
  const prevMonthLastDate = new Date(year, month - 1, 0).getDate();
  const prevDays = [];
  for (let i = leadingOffset - 1; i >= 0; i--) {
    prevDays.push(prevMonthLastDate - i);
  }

  // Next month leading padding
  const totalSlots = Math.ceil((leadingOffset + days.length) / 7) * 7;
  const trailingCount = totalSlots - (leadingOffset + days.length);
  const nextDays = [];
  for (let i = 1; i <= trailingCount; i++) {
    nextDays.push(i);
  }

  // Today check
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
  const todayDate = today.getDate();

  // Quick fill single day with standard hours
  const handleQuickFillDay = (e: React.MouseEvent, day: DayRecord) => {
    e.stopPropagation();
    const calc = calculateWorkHoursAndOvertime(
      standardIn || "08:30",
      standardOut || "17:00",
      day.isWeekend,
      day.isHoliday,
      standardIn,
      standardOut
    );

    const updated = days.map((d) =>
      d.id === day.id
        ? {
            ...d,
            jamMasuk: standardIn || "08:30",
            jamPulang: standardOut || "17:00",
            totalJamKerja: calc.formattedTotal,
            totalMinutes: calc.totalMinutes,
            statusKehadiran: "H",
            isLembur: calc.isOvertime,
            project: d.project || defaultProject,
          }
        : d
    );
    onUpdateDays(updated);
  };

  // Filtered days preview for count
  const filteredDays = days.filter((d) => {
    if (filterStatus === "ALL") return true;
    if (filterStatus === "H") return d.statusKehadiran === "H";
    if (filterStatus === "LEMBUR") return d.isLembur;
    if (filterStatus === "CUTI") return d.statusKehadiran === "C";
    if (filterStatus === "SAKIT") return d.statusKehadiran === "S";
    if (filterStatus === "EMPTY") return !d.statusKehadiran && !d.isWeekend && !d.isHoliday;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Calendar Toolbar & Action Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        {/* Left: Title & Save Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60 shadow-2xs">
              <CalendarIcon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                Kalender Timesheet
              </h3>
              <p className="text-[11px] text-slate-500 leading-tight">
                Klik tanggal untuk mengisi kehadiran & uraian tugas
              </p>
            </div>
          </div>

          {isSaving && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600">
              <span className="h-2 w-2 animate-ping rounded-full bg-amber-500" />
              Menyimpan...
            </span>
          )}
        </div>

        {/* Right: Actions & Exports */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Import IHCS PDF */}
          <button
            onClick={onOpenImportModal}
            className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/80 px-3.5 py-2 text-xs font-bold text-blue-700 shadow-2xs hover:bg-blue-100 transition cursor-pointer"
            title="Upload & Import Laporan Kehadiran Karyawan IHCS (.pdf)"
          >
            <Upload className="h-3.5 w-3.5 text-blue-600" />
            <span>Import PDF IHCS</span>
          </button>

          {/* Export Dropdown / Buttons */}
          <div className="relative">
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm shadow-blue-600/30 hover:bg-blue-700 transition"
            >
              <Download className="h-3.5 w-3.5" />
              Download Laporan
            </button>

            {isExportMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsExportMenuOpen(false)}
                />
                <div className="absolute right-0 z-30 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in-50 zoom-in-95 duration-150">
                  <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                    Export Dokumen Resmi
                  </div>

                  <button
                    onClick={() => {
                      setIsExportMenuOpen(false);
                      onExportExcel();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl p-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                      <FileSpreadsheet className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-bold">Absensi Manual ({activeVendor.shortName}) (.xlsx)</div>
                      <div className="text-[10px] text-slate-500">
                        Format resmi Excel A4 ({activeVendor.shortName})
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setIsExportMenuOpen(false);
                      onExportSddDocx();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl p-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-900 transition"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-bold">SPKL Vendor (.docx)</div>
                      <div className="text-[10px] text-slate-500">
                        Surat Perintah Kerja Lembur (Vendor)
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setIsExportMenuOpen(false);
                      onExportBniDocx();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl p-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-900 transition"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-bold">Form Lembur BNI (.docx)</div>
                      <div className="text-[10px] text-slate-500">
                        Template pengajuan lembur bank
                      </div>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80 text-center text-xs font-bold text-slate-700">
          {weekDays.map((wd, idx) => (
            <div
              key={idx}
              className={`py-3 ${
                wd.isWeekend ? "bg-slate-100/60 text-slate-500" : "text-slate-800"
              }`}
            >
              <span>{wd.label}</span>
            </div>
          ))}
        </div>

        {/* 7-Column Days Grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-200/70 bg-slate-100/40">
          {/* Previous Month Dimmed Days */}
          {prevDays.map((d, idx) => (
            <div
              key={`prev-${idx}`}
              className="min-h-[140px] sm:min-h-[150px] p-2 bg-slate-50/60 opacity-40 select-none cursor-default"
            >
              <span className="text-xs font-bold text-slate-400">{d}</span>
            </div>
          ))}

          {/* Current Month Active Days */}
          {days.map((day) => {
            const isToday = isCurrentMonth && day.day === todayDate;
            const hasData = !!(day.statusKehadiran || day.jamMasuk || day.kegiatan);

            return (
              <div
                key={day.id}
                onClick={() => onOpenDayModal(day)}
                className={`group relative min-h-[140px] sm:min-h-[155px] p-2 sm:p-2.5 transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                  day.isWeekend
                    ? "bg-slate-50/80 hover:bg-slate-100/90"
                    : day.isHoliday
                    ? "bg-rose-50/40 hover:bg-rose-50/70"
                    : "bg-white hover:bg-blue-50/30"
                } hover:shadow-md hover:z-10`}
              >
                {/* Day Header (Number, Holiday badge, Quick Fill Button) */}
                <div>
                  <div className="flex items-start justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black transition ${
                          isToday
                            ? "bg-blue-600 text-white shadow-xs"
                            : day.isWeekend
                            ? "text-slate-500 font-bold"
                            : "text-slate-800"
                        }`}
                      >
                        {day.day}
                      </span>

                      {/* Status Pill */}
                      {day.statusKehadiran && (
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-[10px] font-black tracking-wider uppercase ${
                            day.statusKehadiran === "H"
                              ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-500/20"
                              : day.statusKehadiran === "C"
                              ? "bg-sky-100 text-sky-800 ring-1 ring-sky-500/20"
                              : day.statusKehadiran === "S"
                              ? "bg-rose-100 text-rose-800 ring-1 ring-rose-500/20"
                              : "bg-amber-100 text-amber-800 ring-1 ring-amber-500/20"
                          }`}
                        >
                          {day.statusKehadiran}
                        </span>
                      )}

                      {/* Overtime Flame Badge */}
                      {day.isLembur && (
                        <span
                          title="Lembur"
                          className="flex items-center rounded-md bg-orange-100 px-1 py-0.5 text-[10px] font-bold text-orange-800 ring-1 ring-orange-500/20"
                        >
                          <Flame className="h-3 w-3 text-orange-600" />
                        </span>
                      )}
                    </div>

                    {/* Quick Add Button on Hover for empty days */}
                    {!hasData && !day.isWeekend && !day.isHoliday && (
                      <button
                        type="button"
                        onClick={(e) => handleQuickFillDay(e, day)}
                        title="Isi Cepat Hadir Normal (08:30 - 17:00)"
                        className="opacity-0 group-hover:opacity-100 transition-opacity rounded-md bg-blue-50 p-1 text-blue-600 hover:bg-blue-600 hover:text-white"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  {/* Public Holiday Banner */}
                  {day.isHoliday && day.holidayName && (
                    <div className="mb-1 rounded-md bg-rose-100/80 px-1.5 py-0.5 text-[10px] font-bold text-rose-800 truncate" title={day.holidayName}>
                      🎉 {day.holidayName}
                    </div>
                  )}

                  {/* Working Hours & Duration */}
                  {(day.jamMasuk || day.jamPulang) && (
                    <div className="mb-1 flex items-center justify-between text-[11px] font-mono text-slate-700 bg-slate-100/70 px-1.5 py-0.5 rounded-md border border-slate-200/50">
                      <span className="font-semibold">
                        {day.jamMasuk || "--:--"} - {day.jamPulang || "--:--"}
                      </span>
                      {day.totalJamKerja && (
                        <span className="text-[10px] font-bold text-slate-900">
                          {day.totalJamKerja}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Project Tag */}
                  {day.project && (
                    <div className="mb-1">
                      <span className="inline-block rounded bg-slate-200/70 px-1.5 py-0.5 text-[9px] font-bold text-slate-700 uppercase tracking-wider truncate max-w-full">
                        {day.project}
                      </span>
                    </div>
                  )}
                </div>

                {/* Kegiatan / Task Description Snippet */}
                <div className="mt-1">
                  {day.kegiatan ? (
                    <p
                      className="text-[11px] leading-snug text-slate-600 line-clamp-2"
                      title={day.kegiatan}
                    >
                      {day.kegiatan}
                    </p>
                  ) : !day.isWeekend && !day.isHoliday ? (
                    <span className="text-[10px] text-slate-300 group-hover:text-slate-400 italic transition-colors">
                      + Tambah kegiatan
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}

          {/* Next Month Dimmed Days */}
          {nextDays.map((d, idx) => (
            <div
              key={`next-${idx}`}
              className="min-h-[140px] sm:min-h-[150px] p-2 bg-slate-50/60 opacity-40 select-none cursor-default"
            >
              <span className="text-xs font-bold text-slate-400">{d}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Legend & Summary Info */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 px-2 py-1 gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-bold text-slate-700">Keterangan:</span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            <strong className="text-slate-700">H</strong> = Hadir
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-sky-500" />
            <strong className="text-slate-700">C</strong> = Cuti
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
            <strong className="text-slate-700">I</strong> = Izin
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-rose-500" />
            <strong className="text-slate-700">S</strong> = Sakit
          </span>
          <span className="flex items-center gap-1">
            <Flame className="h-3.5 w-3.5 text-orange-600" />
            <strong className="text-orange-800">Lembur</strong> (Workday &gt; 11h 30m / Pulang &gt; 20:00 / Weekend &gt; 8h)
          </span>
        </div>

        <div className="text-[11px] text-slate-400">
          💡 Klik tanggal mana saja untuk membuka popup pengisian detail
        </div>
      </div>

    </div>
  );
};
