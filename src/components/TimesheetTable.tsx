"use client";

import React, { useState } from "react";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Building2,
  Sparkles,
  RefreshCw,
  Edit3,
  Copy,
  Trash2,
  CheckCircle2,
  Clock3,
  Calendar,
  Filter,
} from "lucide-react";
import { calculateWorkHoursAndOvertime, formatTableDate } from "@/lib/time-calc";
import { TimeInput } from "./TimeInput";

export interface DayRecord {
  id: string;
  day: number;
  dateStr: string;
  dayName: string;
  isWeekend: boolean;
  isHoliday: boolean;
  holidayName?: string | null;
  jamMasuk: string;
  jamPulang: string;
  totalJamKerja: string;
  totalMinutes: number;
  statusKehadiran: string;
  isLembur: boolean;
  project: string;
  projectCode: string;
  aipFitur: string;
  kegiatan: string;
  overtimeNotes?: string;
}

interface TimesheetTableProps {
  days: DayRecord[];
  year: number;
  month: number;
  defaultProject: string;
  standardIn: string;
  standardOut: string;
  isSaving: boolean;
  onUpdateDays: (updatedDays: DayRecord[]) => void;
  onOpenDayModal: (day: DayRecord) => void;
  onOpenQuickFill: () => void;
  viewMode?: "calendar" | "table";
  onViewModeChange?: (mode: "calendar" | "table") => void;
  onExportExcel: () => void;
  onExportSddDocx: () => void;
  onExportBniDocx: () => void;
}

export const TimesheetTable: React.FC<TimesheetTableProps> = ({
  days,
  year,
  month,
  defaultProject,
  standardIn,
  standardOut,
  isSaving,
  viewMode,
  onViewModeChange,
  onUpdateDays,
  onOpenDayModal,
  onOpenQuickFill,
  onExportExcel,
  onExportSddDocx,
  onExportBniDocx,
}) => {
  const [filterMode, setFilterMode] = useState<"all" | "workdays" | "overtime">("all");

  // Handle inline change for a single day
  const handleCellChange = (
    index: number,
    field: keyof DayRecord,
    value: any
  ) => {
    const updated = [...days];
    const day = { ...updated[index], [field]: value };

    // If time inputs changed, auto-recalculate
    if (field === "jamMasuk" || field === "jamPulang") {
      const calc = calculateWorkHoursAndOvertime(
        field === "jamMasuk" ? value : day.jamMasuk,
        field === "jamPulang" ? value : day.jamPulang,
        day.isWeekend,
        day.isHoliday,
        standardIn,
        standardOut
      );

      day.totalJamKerja = calc.formattedTotal;
      day.totalMinutes = calc.totalMinutes;
      day.isLembur = calc.isOvertime;

      if (!day.statusKehadiran && calc.attendanceStatus) {
        day.statusKehadiran = calc.attendanceStatus;
      }
      if (!day.project && !day.isWeekend && !day.isHoliday) {
        day.project = defaultProject || "Collection";
      }
    }

    // If status changed to Sakit, suggest "Sick Leave" if empty
    if (field === "statusKehadiran" && value === "S" && !day.kegiatan) {
      day.kegiatan = "Sick Leave";
    }

    updated[index] = day;
    onUpdateDays(updated);
  };

  // Toggle Lembur manually
  const handleToggleLembur = (index: number) => {
    const updated = [...days];
    updated[index] = {
      ...updated[index],
      isLembur: !updated[index].isLembur,
    };
    onUpdateDays(updated);
  };

  // Copy previous day's hours and project
  const handleCopyPrev = (index: number) => {
    if (index === 0) return;
    const prev = days[index - 1];
    const current = days[index];

    const updated = [...days];
    const calc = calculateWorkHoursAndOvertime(
      prev.jamMasuk,
      prev.jamPulang,
      current.isWeekend,
      current.isHoliday,
      standardIn,
      standardOut
    );

    updated[index] = {
      ...current,
      jamMasuk: prev.jamMasuk,
      jamPulang: prev.jamPulang,
      totalJamKerja: calc.formattedTotal,
      totalMinutes: calc.totalMinutes,
      isLembur: calc.isOvertime,
      statusKehadiran: prev.statusKehadiran || "H",
      project: prev.project || defaultProject,
      projectCode: prev.projectCode || "",
    };
    onUpdateDays(updated);
  };

  // Reset row to default
  const handleResetRow = (index: number) => {
    const current = days[index];
    const updated = [...days];

    let defaultKegiatan = "";
    if (current.isWeekend) {
      defaultKegiatan = current.dayName === "Sabtu" ? "Sabtu" : "Minggu";
    } else if (current.isHoliday && current.holidayName) {
      defaultKegiatan = current.holidayName;
    }

    updated[index] = {
      ...current,
      jamMasuk: "",
      jamPulang: "",
      totalJamKerja: "",
      totalMinutes: 0,
      statusKehadiran: "",
      isLembur: false,
      project: current.isWeekend || current.isHoliday ? "" : defaultProject,
      projectCode: "",
      aipFitur: "",
      kegiatan: defaultKegiatan,
      overtimeNotes: "",
    };
    onUpdateDays(updated);
  };

  // Filter days
  const filteredDays = days.filter((d) => {
    if (filterMode === "workdays") return !d.isWeekend && !d.isHoliday;
    if (filterMode === "overtime") return d.isLembur;
    return true;
  });

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
      {/* Top Action & Export Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/60 p-4">
        {/* Left: Quick Actions & Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {onViewModeChange && (
            <div className="flex items-center rounded-xl bg-slate-200/70 p-0.5 border border-slate-200 shadow-2xs">
              <button
                onClick={() => onViewModeChange("calendar")}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 transition"
              >
                <Calendar className="h-3.5 w-3.5 text-blue-600" />
                <span>Kalender</span>
              </button>
              <button
                onClick={() => onViewModeChange("table")}
                className="flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-blue-600 shadow-xs transition"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>Tabel</span>
              </button>
            </div>
          )}

          <button
            onClick={onOpenQuickFill}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:opacity-95 hover:shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Isi Otomatis Jam Standar</span>
          </button>

          {/* Filter Pills */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-white p-0.5 shadow-2xs">
            <button
              onClick={() => setFilterMode("all")}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                filterMode === "all"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Semua ({days.length})
            </button>
            <button
              onClick={() => setFilterMode("workdays")}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                filterMode === "workdays"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Hari Kerja
            </button>
            <button
              onClick={() => setFilterMode("overtime")}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                filterMode === "overtime"
                  ? "bg-orange-600 text-white"
                  : "text-orange-700 hover:text-orange-900"
              }`}
            >
              <span>Lembur</span>
              <span className="rounded-full bg-orange-100 px-1 text-[10px] font-bold text-orange-800">
                {days.filter((d) => d.isLembur).length}
              </span>
            </button>
          </div>

          {/* Save indicator */}
          <div className="flex items-center gap-1.5 pl-2 text-xs text-slate-500">
            {isSaving ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-600" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Tersimpan otomatis</span>
              </>
            )}
          </div>
        </div>

        {/* Right: Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Excel Export */}
          <button
            onClick={onExportExcel}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50/80 px-3 py-1.5 text-xs font-bold text-emerald-800 shadow-2xs transition hover:bg-emerald-100"
            title="Download Absensi Manual Excel 100% Identik"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Excel SDD (.xlsx)</span>
          </button>

          {/* Word SDD SPKL */}
          <button
            onClick={onExportSddDocx}
            className="flex items-center gap-1.5 rounded-xl border border-blue-300 bg-blue-50/80 px-3 py-1.5 text-xs font-bold text-blue-800 shadow-2xs transition hover:bg-blue-100"
            title="Download Surat Perintah Kerja Lembur SDD (SDD-FM-HRD-04-01)"
          >
            <FileText className="h-4 w-4 text-blue-600" />
            <span>Word SPKL Vendor (.docx)</span>
          </button>

          {/* Word BNI Overtime */}
          <button
            onClick={onExportBniDocx}
            className="flex items-center gap-1.5 rounded-xl border border-indigo-300 bg-indigo-50/80 px-3 py-1.5 text-xs font-bold text-indigo-800 shadow-2xs transition hover:bg-indigo-100"
            title="Download Formulir Perintah & Persetujuan Lembur BNI"
          >
            <Building2 className="h-4 w-4 text-indigo-600" />
            <span>Word Lembur BNI (.docx)</span>
          </button>
        </div>
      </div>

      {/* Interactive Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-100/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="w-12 px-3 py-3 text-center">No</th>
              <th className="w-28 px-3 py-3">Tanggal</th>
              <th className="w-24 px-2 py-3 text-center">Jam Masuk</th>
              <th className="w-24 px-2 py-3 text-center">Jam Pulang</th>
              <th className="w-24 px-2 py-3 text-center">Total Jam</th>
              <th className="w-36 px-2 py-3 text-center">Status Kehadiran</th>
              <th className="w-20 px-2 py-3 text-center">Lembur</th>
              <th className="w-32 px-2 py-3">Project</th>
              <th className="min-w-[280px] px-3 py-3">Kegiatan / Uraian Tugas</th>
              <th className="w-20 px-2 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredDays.map((day) => {
              const originalIndex = days.findIndex((d) => d.id === day.id);
              const dateObj = new Date(year, month - 1, day.day);
              const formattedDate = formatTableDate(dateObj);

              // Row background logic
              let rowBg = "hover:bg-slate-50/70";
              if (day.isLembur) {
                rowBg = "bg-orange-50/40 hover:bg-orange-50/70 border-l-4 border-l-orange-500";
              } else if (day.isHoliday) {
                rowBg = "bg-rose-50/40 hover:bg-rose-50/70 border-l-4 border-l-rose-400";
              } else if (day.isWeekend) {
                rowBg = "bg-slate-50/70 hover:bg-slate-100/60";
              } else if (day.statusKehadiran === "S") {
                rowBg = "bg-yellow-50/40 hover:bg-yellow-50/70";
              }

              return (
                <tr key={day.id} className={`transition-colors ${rowBg}`}>
                  {/* No */}
                  <td className="px-3 py-2.5 text-center font-bold text-slate-500">
                    {day.day}
                  </td>

                  {/* Tanggal & Hari Badge */}
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <div className="font-semibold text-slate-900">{formattedDate}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span
                        className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          day.isWeekend
                            ? "bg-slate-200 text-slate-700"
                            : day.isHoliday
                            ? "bg-rose-100 text-rose-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {day.dayName}
                      </span>
                      {day.isHoliday && (
                        <span className="text-[10px] text-rose-600 font-medium truncate max-w-[90px]" title={day.holidayName || ""}>
                          {day.holidayName}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Jam Masuk */}
                  <td className="px-2 py-2 text-center">
                    <TimeInput
                      placeholder="08:30"
                      value={day.jamMasuk}
                      onChange={(newVal) =>
                        handleCellChange(originalIndex, "jamMasuk", newVal)
                      }
                      className="table-input w-20 rounded-lg border border-slate-200 bg-white px-2 py-1 text-center font-mono text-xs font-semibold text-slate-800 focus:border-blue-500"
                    />
                  </td>

                  {/* Jam Pulang */}
                  <td className="px-2 py-2 text-center">
                    <TimeInput
                      placeholder="17:00"
                      value={day.jamPulang}
                      onChange={(newVal) =>
                        handleCellChange(originalIndex, "jamPulang", newVal)
                      }
                      className="table-input w-20 rounded-lg border border-slate-200 bg-white px-2 py-1 text-center font-mono text-xs font-semibold text-slate-800 focus:border-blue-500"
                    />
                  </td>

                  {/* Total Jam Kerja */}
                  <td className="px-2 py-2 text-center whitespace-nowrap">
                    {day.totalJamKerja ? (
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 font-mono text-xs font-bold ${
                          day.isLembur
                            ? "bg-orange-100 text-orange-900 ring-1 ring-orange-400/40"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        <Clock3 className="h-3 w-3 text-slate-500" />
                        {day.totalJamKerja}
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>

                  {/* Status Kehadiran (H, C, I, S) */}
                  <td className="px-2 py-2 text-center">
                    <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
                      {[
                        { code: "H", label: "H", color: "bg-emerald-600 text-white" },
                        { code: "C", label: "C", color: "bg-sky-600 text-white" },
                        { code: "I", label: "I", color: "bg-amber-500 text-white" },
                        { code: "S", label: "S", color: "bg-rose-600 text-white" },
                      ].map((item) => (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => {
                            const newStatus =
                              day.statusKehadiran === item.code ? "" : item.code;
                            handleCellChange(originalIndex, "statusKehadiran", newStatus);
                          }}
                          className={`h-6 w-6 rounded-md font-bold text-xs transition ${
                            day.statusKehadiran === item.code
                              ? item.color
                              : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                          }`}
                          title={`Status ${item.label}`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </td>

                  {/* Lembur (L) Tag */}
                  <td className="px-2 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleLembur(originalIndex)}
                      className={`h-7 w-9 rounded-lg font-bold text-xs transition shadow-2xs ${
                        day.isLembur
                          ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs shadow-orange-500/30 scale-105"
                          : "border border-slate-200 bg-white text-slate-300 hover:text-slate-600"
                      }`}
                      title={day.isLembur ? "Hari Lembur (Aktif)" : "Bukan Lembur (Klik untuk aktifkan)"}
                    >
                      {day.isLembur ? "L" : "-"}
                    </button>
                  </td>

                  {/* Project */}
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      placeholder="Project..."
                      value={day.project}
                      onChange={(e) =>
                        handleCellChange(originalIndex, "project", e.target.value)
                      }
                      className="table-input w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500"
                    />
                  </td>

                  {/* Kegiatan / Task Description */}
                  <td className="px-3 py-2">
                    <div className="relative flex items-center">
                      <textarea
                        rows={1}
                        placeholder={
                          day.isWeekend
                            ? day.dayName
                            : day.isHoliday
                            ? day.holidayName || "Libur"
                            : "Uraian tugas / kegiatan..."
                        }
                        value={day.kegiatan}
                        onChange={(e) =>
                          handleCellChange(originalIndex, "kegiatan", e.target.value)
                        }
                        className="table-input w-full resize-y rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 min-h-[30px]"
                      />
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-2 py-2 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => onOpenDayModal(day)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                        title="Buka Editor Rinci"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyPrev(originalIndex)}
                        disabled={originalIndex === 0}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                        title="Salin dari Hari Sebelumnya"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleResetRow(originalIndex)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                        title="Reset Baris Ini"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
