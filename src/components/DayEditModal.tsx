"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Clock,
  Briefcase,
  Flame,
  Check,
  CheckCircle2,
  FileText,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { DayRecord } from "./TimesheetTable";
import { calculateWorkHoursAndOvertime } from "@/lib/time-calc";
import { TimeInput } from "./TimeInput";

interface DayEditModalProps {
  day: DayRecord | null;
  allDays?: DayRecord[];
  isOpen: boolean;
  standardIn: string;
  standardOut: string;
  defaultProject: string;
  onClose: () => void;
  onSave: (updatedDay: DayRecord) => void;
  onSelectDay?: (day: DayRecord) => void;
}

export const DayEditModal: React.FC<DayEditModalProps> = ({
  day,
  allDays = [],
  isOpen,
  standardIn,
  standardOut,
  defaultProject,
  onClose,
  onSave,
  onSelectDay,
}) => {
  const [formData, setFormData] = useState<DayRecord | null>(null);

  useEffect(() => {
    if (day) {
      setFormData({ ...day });
    }
  }, [day]);

  if (!isOpen || !formData) return null;

  // Day navigation logic
  const currentIndex = allDays.findIndex((d) => d.id === formData.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < allDays.length - 1;

  const handlePrevDay = () => {
    if (hasPrev && onSelectDay) {
      // Auto-save current before jumping
      onSave(formData);
      onSelectDay(allDays[currentIndex - 1]);
    }
  };

  const handleNextDay = () => {
    if (hasNext && onSelectDay) {
      // Auto-save current before jumping
      onSave(formData);
      onSelectDay(allDays[currentIndex + 1]);
    }
  };

  // Handle time updates with recalculation
  const handleTimeChange = (field: "jamMasuk" | "jamPulang", value: string) => {
    const nextIn = field === "jamMasuk" ? value : formData.jamMasuk;
    const nextOut = field === "jamPulang" ? value : formData.jamPulang;

    const calc = calculateWorkHoursAndOvertime(
      nextIn,
      nextOut,
      formData.isWeekend,
      formData.isHoliday,
      standardIn,
      standardOut
    );

    setFormData({
      ...formData,
      [field]: value,
      totalJamKerja: calc.formattedTotal,
      totalMinutes: calc.totalMinutes,
      isLembur: calc.isOvertime,
      statusKehadiran: formData.statusKehadiran || (calc.attendanceStatus as string),
      project: formData.project || defaultProject,
    });
  };

  // Status toggle logic (H, C, I, S)
  const handleStatusToggle = (code: string) => {
    if (formData.statusKehadiran === code) {
      // Uncheck
      setFormData({
        ...formData,
        statusKehadiran: "",
      });
    } else {
      // Check this one
      const updated = {
        ...formData,
        statusKehadiran: code,
      };

      // Auto-fill defaults for Cuti or Sakit if empty
      if (code === "C" && !formData.kegiatan) {
        updated.kegiatan = "Cuti Tahunan";
      } else if (code === "S" && !formData.kegiatan) {
        updated.kegiatan = "Sick Leave";
      } else if (code === "I" && !formData.kegiatan) {
        updated.kegiatan = "Izin";
      } else if (code === "H" && !formData.jamMasuk && !formData.jamPulang) {
        updated.jamMasuk = standardIn || "08:30";
        updated.jamPulang = standardOut || "17:00";
        const calc = calculateWorkHoursAndOvertime(
          updated.jamMasuk,
          updated.jamPulang,
          formData.isWeekend,
          formData.isHoliday,
          standardIn,
          standardOut
        );
        updated.totalJamKerja = calc.formattedTotal;
        updated.totalMinutes = calc.totalMinutes;
        updated.isLembur = calc.isOvertime;
        updated.project = formData.project || defaultProject;
      }

      setFormData(updated);
    }
  };

  // Quick Preset Handlers
  const applyPreset = (preset: "normal" | "overtime" | "halfday" | "sakit" | "cuti" | "clear") => {
    if (preset === "normal") {
      const calc = calculateWorkHoursAndOvertime(
        standardIn || "08:30",
        standardOut || "17:00",
        formData.isWeekend,
        formData.isHoliday,
        standardIn,
        standardOut
      );
      setFormData({
        ...formData,
        jamMasuk: standardIn || "08:30",
        jamPulang: standardOut || "17:00",
        totalJamKerja: calc.formattedTotal,
        totalMinutes: calc.totalMinutes,
        isLembur: false,
        statusKehadiran: "H",
        project: formData.project || defaultProject,
      });
    } else if (preset === "overtime") {
      const calc = calculateWorkHoursAndOvertime("08:00", "22:00", false, false, standardIn, standardOut);
      setFormData({
        ...formData,
        jamMasuk: "08:00",
        jamPulang: "22:00",
        totalJamKerja: calc.formattedTotal,
        totalMinutes: calc.totalMinutes,
        isLembur: true,
        statusKehadiran: "H",
        project: formData.project || defaultProject,
      });
    } else if (preset === "halfday") {
      const calc = calculateWorkHoursAndOvertime("07:46", "14:30", false, false, standardIn, standardOut);
      setFormData({
        ...formData,
        jamMasuk: "07:46",
        jamPulang: "14:30",
        totalJamKerja: calc.formattedTotal,
        totalMinutes: calc.totalMinutes,
        isLembur: false,
        statusKehadiran: "H",
        project: formData.project || defaultProject,
        kegiatan: formData.kegiatan || "fix defect & support UAT (Halfday)",
      });
    } else if (preset === "sakit") {
      setFormData({
        ...formData,
        jamMasuk: "",
        jamPulang: "",
        totalJamKerja: "",
        totalMinutes: 0,
        isLembur: false,
        statusKehadiran: "S",
        kegiatan: formData.kegiatan || "Sick Leave",
      });
    } else if (preset === "cuti") {
      setFormData({
        ...formData,
        jamMasuk: "",
        jamPulang: "",
        totalJamKerja: "",
        totalMinutes: 0,
        isLembur: false,
        statusKehadiran: "C",
        kegiatan: formData.kegiatan || "Cuti Tahunan",
      });
    } else if (preset === "clear") {
      setFormData({
        ...formData,
        jamMasuk: "",
        jamPulang: "",
        totalJamKerja: "",
        totalMinutes: 0,
        isLembur: false,
        statusKehadiran: "",
        project: "",
        projectCode: "",
        aipFitur: "",
        kegiatan: "",
        overtimeNotes: "",
      });
    }
  };

  const handleSave = () => {
    if (formData) {
      onSave(formData);
      onClose();
    }
  };

  const statusOptions = [
    { code: "H", label: "Hadir (H)", desc: "Bekerja di kantor/remote", color: "emerald" },
    { code: "C", label: "Cuti (C)", desc: "Cuti tahunan / bersama", color: "sky" },
    { code: "I", label: "Izin (I)", desc: "Izin tidak masuk", color: "amber" },
    { code: "S", label: "Sakit (S)", desc: "Sakit dengan surat/keterangan", color: "rose" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/90 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white font-black text-lg shadow-sm shadow-blue-500/30">
              {formData.day}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">
                  {formData.dayName}, {formData.dateStr}
                </h3>
                {formData.isWeekend && (
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                    Weekend
                  </span>
                )}
                {formData.isHoliday && (
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                    {formData.holidayName || "Hari Libur"}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Pencatatan jam kerja, status kehadiran, dan uraian tugas harian
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onSelectDay && allDays.length > 0 && (
              <div className="flex items-center rounded-xl border border-slate-200 bg-white p-0.5 shadow-2xs mr-1">
                <button
                  type="button"
                  onClick={handlePrevDay}
                  disabled={!hasPrev}
                  title="Hari Sebelumnya"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextDay}
                  disabled={!hasNext}
                  title="Hari Berikutnya"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Quick Presets Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Preset Cepat
              </label>
              <button
                type="button"
                onClick={() => applyPreset("clear")}
                className="text-[11px] font-semibold text-slate-400 hover:text-rose-600 transition flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" />
                Kosongkan Hari
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => applyPreset("normal")}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition"
              >
                🕒 Normal ({standardIn || "08:30"} - {standardOut || "17:00"})
              </button>
              <button
                type="button"
                onClick={() => applyPreset("overtime")}
                className="rounded-xl border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-800 hover:bg-orange-100 transition flex items-center gap-1"
              >
                <Flame className="h-3.5 w-3.5 text-orange-600" />
                Lembur (08:00 - 22:00)
              </button>
              <button
                type="button"
                onClick={() => applyPreset("halfday")}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                ⏱️ Halfday (07:46 - 14:30)
              </button>
              <button
                type="button"
                onClick={() => applyPreset("cuti")}
                className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-800 hover:bg-sky-100 transition"
              >
                🌴 Cuti (C)
              </button>
              <button
                type="button"
                onClick={() => applyPreset("sakit")}
                className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-100 transition"
              >
                🤒 Sakit (S)
              </button>
            </div>
          </div>

          {/* Status Kehadiran (Checkboxes / Selectors for H, C, I, S) */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4">
            <label className="text-xs font-bold text-slate-800 block mb-2.5">
              Status Kehadiran
            </label>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {statusOptions.map((item) => {
                const isChecked = formData.statusKehadiran === item.code;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => handleStatusToggle(item.code)}
                    className={`flex w-full items-start gap-2.5 rounded-xl border p-2.5 text-left transition select-none ${
                      isChecked
                        ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80"
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition ${
                        isChecked
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 leading-tight">
                        {item.label}
                      </div>
                      <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                        {item.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Fields (Jam Masuk, Jam Keluar) & Duration */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-blue-600" />
                Waktu Kerja & Jam
              </label>
              {formData.isLembur && (
                <span className="flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-[11px] font-bold text-orange-800 ring-1 ring-orange-500/20">
                  <Flame className="h-3.5 w-3.5 text-orange-600" />
                  Kategori Lembur
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  Jam Masuk (HH:mm)
                </label>
                <TimeInput
                  placeholder="08:30"
                  value={formData.jamMasuk}
                  onChange={(val) => handleTimeChange("jamMasuk", val)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  Jam Keluar (HH:mm)
                </label>
                <TimeInput
                  placeholder="17:00"
                  value={formData.jamPulang}
                  onChange={(val) => handleTimeChange("jamPulang", val)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  Total Jam Kerja
                </label>
                <div className="flex h-[38px] items-center justify-between rounded-xl bg-slate-100 px-3 text-xs font-bold font-mono text-slate-900 border border-slate-200/60">
                  <span>{formData.totalJamKerja || "0:00"}</span>
                  <span className="text-[10px] font-normal text-slate-500">
                    {formData.totalMinutes ? `${formData.totalMinutes} menit` : "-"}
                  </span>
                </div>
              </div>
            </div>

            {/* Manual overtime toggle override */}
            <div className="pt-1 flex items-center justify-between border-t border-slate-100">
              <span className="text-[11px] text-slate-500">
                Otomatis dihitung lembur jika kerja &gt; 11h 30m / pulang &gt; 20:00 / weekend &gt; 8h
              </span>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isLembur: !formData.isLembur })}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition border ${
                  formData.isLembur
                    ? "bg-orange-50 border-orange-200 text-orange-800"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                {formData.isLembur ? "🔥 Flag Lembur Aktif" : "Set Manual Lembur"}
              </button>
            </div>
          </div>

          {/* Project Details (Project, Project Code, AP Fitur) */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 space-y-3">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Briefcase className="h-4 w-4 text-blue-600" />
              Informasi Proyek
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  Project
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Collection"
                  value={formData.project}
                  onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  Project Code
                </label>
                <input
                  type="text"
                  placeholder="Contoh: PRJ-001"
                  value={formData.projectCode || ""}
                  onChange={(e) => setFormData({ ...formData, projectCode: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  AP Fitur / AIP Fitur
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Strategy / Payment"
                  value={formData.aipFitur || ""}
                  onChange={(e) => setFormData({ ...formData, aipFitur: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          {/* Kegiatan / Keterangan (What they were doing that day) */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-blue-600" />
                Keterangan / Kegiatan
              </label>
              <span className="text-[11px] text-slate-400">
                Dicetak pada lembar Absensi Excel & SPKL Word
              </span>
            </div>
            <textarea
              rows={4}
              placeholder="Deskripsikan pekerjaan / tugas yang dikerjakan pada hari ini..."
              value={formData.kegiatan || ""}
              onChange={(e) => setFormData({ ...formData, kegiatan: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-800 leading-relaxed focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Overtime Justification Note (if overtime) */}
          {formData.isLembur && (
            <div className="rounded-2xl border border-orange-200/80 bg-orange-50/40 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-orange-900 flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-orange-600" />
                  Alasan Lembur Khusus (Optional)
                </label>
                <span className="text-[11px] text-orange-700">
                  Untuk justifikasi di Form Lembur BNI
                </span>
              </div>
              <input
                type="text"
                placeholder="Contoh: Deployment OCP & critical bugfix release"
                value={formData.overtimeNotes || ""}
                onChange={(e) => setFormData({ ...formData, overtimeNotes: e.target.value })}
                className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/90 px-6 py-4">
          <div className="text-xs text-slate-500">
            {formData.statusKehadiran ? (
              <span>
                Status: <strong className="text-slate-800">{formData.statusKehadiran}</strong>
                {formData.totalJamKerja && ` (${formData.totalJamKerja})`}
              </span>
            ) : (
              <span>Belum ada status kehadiran</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition shadow-sm shadow-blue-600/30 flex items-center gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
