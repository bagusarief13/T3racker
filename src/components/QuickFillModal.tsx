"use client";

import React, { useState } from "react";
import { X, Sparkles, Check } from "lucide-react";
import { DayRecord } from "./TimesheetTable";
import { calculateWorkHoursAndOvertime } from "@/lib/time-calc";
import { TimeInput } from "./TimeInput";

interface QuickFillModalProps {
  isOpen: boolean;
  days: DayRecord[];
  standardIn: string;
  standardOut: string;
  defaultProject: string;
  onClose: () => void;
  onApply: (updatedDays: DayRecord[]) => void;
}

export const QuickFillModal: React.FC<QuickFillModalProps> = ({
  isOpen,
  days,
  standardIn,
  standardOut,
  defaultProject,
  onClose,
  onApply,
}) => {
  const [inTime, setInTime] = useState(standardIn || "08:30");
  const [outTime, setOutTime] = useState(standardOut || "17:00");
  const [project, setProject] = useState(defaultProject || "Collection");
  const [onlyEmpty, setOnlyEmpty] = useState(true);
  const [skipWeekendsAndHolidays, setSkipWeekendsAndHolidays] = useState(true);

  if (!isOpen) return null;

  const handleApply = () => {
    const updated = days.map((day) => {
      // Check if should skip weekend or holiday
      if (skipWeekendsAndHolidays && (day.isWeekend || day.isHoliday)) {
        return day;
      }

      // Check if already filled
      if (onlyEmpty && (day.jamMasuk || day.jamPulang || day.statusKehadiran)) {
        return day;
      }

      const calc = calculateWorkHoursAndOvertime(
        inTime,
        outTime,
        day.isWeekend,
        day.isHoliday,
        standardIn,
        standardOut
      );

      return {
        ...day,
        jamMasuk: inTime,
        jamPulang: outTime,
        totalJamKerja: calc.formattedTotal,
        totalMinutes: calc.totalMinutes,
        isLembur: calc.isOvertime,
        statusKehadiran: "H",
        project: project,
      };
    });

    onApply(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Isi Otomatis Jam Standar
              </h3>
              <p className="text-xs text-slate-500">
                Isi jam kerja normal sekaligus untuk hari kerja
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">
                Jam Masuk
              </label>
              <TimeInput
                value={inTime}
                onChange={setInTime}
                placeholder="08:30"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">
                Jam Pulang
              </label>
              <TimeInput
                value={outTime}
                onChange={setOutTime}
                placeholder="17:00"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">
              Nama Project
            </label>
            <input
              type="text"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2 pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={skipWeekendsAndHolidays}
                onChange={(e) => setSkipWeekendsAndHolidays(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs text-slate-700">
                Lewati hari Sabtu, Minggu, dan Hari Libur Nasional
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyEmpty}
                onChange={(e) => setOnlyEmpty(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs text-slate-700">
                Hanya isi hari yang masih kosong (tidak menimpa data yang ada)
              </span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/80 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
          >
            <Check className="h-4 w-4" />
            <span>Terapkan Sekarang</span>
          </button>
        </div>
      </div>
    </div>
  );
};
