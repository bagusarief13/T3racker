"use client";

import React, { useState } from "react";
import {
  User,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Layers,
  Briefcase,
  ShieldCheck,
  Award,
} from "lucide-react";
import { ProfileData } from "./SettingsModal";
import { getIndonesianMonthName } from "@/lib/time-calc";
import { getVendorById } from "@/lib/vendors";

interface EmployeeHeaderFormProps {
  profile: ProfileData | null;
  year: number;
  month: number;
  onMonthChange: (year: number, month: number) => void;
}

export const EmployeeHeaderForm: React.FC<EmployeeHeaderFormProps> = ({
  profile,
  year,
  month,
  onMonthChange,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const activeVendor = getVendorById(profile?.vendor);

  const handlePrevMonth = () => {
    if (month === 1) {
      onMonthChange(year - 1, 12);
    } else {
      onMonthChange(year, month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      onMonthChange(year + 1, 1);
    } else {
      onMonthChange(year, month + 1);
    }
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    onMonthChange(now.getFullYear(), now.getMonth() + 1);
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/90 shadow-xs backdrop-blur-xs transition-all duration-200 overflow-hidden">
      {/* Top Banner / Accordion Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-5 py-3.5 gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 ring-1 ring-blue-500/20">
            <User className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-tight text-slate-900">
                Informasi Karyawan & Periode Timesheet
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Data ini otomatis dicetak pada header dan lembar persetujuan dokumen resmi Excel & Word
            </p>
          </div>
        </div>

        {/* Periode Navigation Buttons & Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
            <button
              onClick={handlePrevMonth}
              title="Bulan Sebelumnya"
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="w-36 sm:w-40 text-center text-xs font-bold text-slate-800 select-none truncate px-1">
              {getIndonesianMonthName(month - 1)} {year}
            </div>
            <button
              onClick={handleNextMonth}
              title="Bulan Berikutnya"
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={handleCurrentMonth}
            className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
          >
            Bulan Ini
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition shadow-2xs"
            title={isCollapsed ? "Tampilkan Informasi" : "Ciutkan Informasi"}
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                isCollapsed ? "-rotate-90" : "rotate-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Informative Labels and Values Grid */}
      {!isCollapsed && (
        <div className="p-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {/* 1. Nama Lengkap */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 hover:bg-slate-100/60 transition-colors">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mb-1">
                <User className="h-3.5 w-3.5 text-blue-600" />
                <span>Nama Lengkap</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 truncate" title={profile?.nama || "-"}>
                {profile?.nama || "-"}
              </p>
            </div>

            {/* 2. NPP */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 hover:bg-slate-100/60 transition-colors">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mb-1">
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
                <span>NPP</span>
              </div>
              <p className="text-xs sm:text-sm font-mono font-bold text-slate-800 truncate">
                {profile?.npp || "-"}
              </p>
            </div>

            {/* 3. Staff ID */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 hover:bg-slate-100/60 transition-colors">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mb-1">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
                <span>Staff ID</span>
              </div>
              <p className="text-xs sm:text-sm font-mono font-bold text-slate-800 truncate">
                {profile?.staffId || "-"}
              </p>
            </div>

            {/* 4. Divisi */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 hover:bg-slate-100/60 transition-colors">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mb-1">
                <Building2 className="h-3.5 w-3.5 text-amber-600" />
                <span>Divisi</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 truncate" title={profile?.divisi || "-"}>
                {profile?.divisi || "-"}
              </p>
            </div>

            {/* 5. Departemen */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 hover:bg-slate-100/60 transition-colors">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mb-1">
                <Briefcase className="h-3.5 w-3.5 text-purple-600" />
                <span>Departemen</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 truncate" title={profile?.departemen || "-"}>
                {profile?.departemen || "-"}
              </p>
            </div>

            {/* 6. Kelompok */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 hover:bg-slate-100/60 transition-colors">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mb-1">
                <Layers className="h-3.5 w-3.5 text-sky-600" />
                <span>Kelompok</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 truncate" title={profile?.kelompok || "-"}>
                {profile?.kelompok || "-"}
              </p>
            </div>

            {/* 7. Vendor / Mitra IT */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 hover:bg-slate-100/60 transition-colors">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mb-1">
                <Building2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Vendor / Mitra IT</span>
              </div>
              <div className="flex items-center gap-2">
                <img
                  src={activeVendor.logo}
                  alt={activeVendor.shortName}
                  className="h-4 w-4 object-contain"
                />
                <p className="text-xs sm:text-sm font-bold text-slate-800 truncate" title={activeVendor.legalName}>
                  {activeVendor.shortName}
                </p>
              </div>
            </div>

            {/* 8. Periode Timesheet */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 hover:bg-slate-100/60 transition-colors">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mb-1">
                <Calendar className="h-3.5 w-3.5 text-blue-600" />
                <span>Periode Timesheet</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                {getIndonesianMonthName(month - 1)} {year}
              </p>
            </div>

            {/* 9. Atasan Langsung (Diperiksa) */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 hover:bg-slate-100/60 transition-colors">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mb-1">
                <User className="h-3.5 w-3.5 text-rose-600" />
                <span>Atasan Langsung (Diperiksa)</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 truncate" title={profile?.diperiksaName || "-"}>
                {profile?.diperiksaName || "-"}
              </p>
              <p className="text-[10px] font-medium text-slate-400 truncate mt-0.5">
                {profile?.diperiksaTitle || "Team Leader"}
              </p>
            </div>

            {/* 10. Department Head (Disetujui) */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 hover:bg-slate-100/60 transition-colors">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mb-1">
                <Award className="h-3.5 w-3.5 text-amber-600" />
                <span>Dept Head (Disetujui)</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 truncate" title={profile?.disetujuiName || "-"}>
                {profile?.disetujuiName || "-"}
              </p>
              <p className="text-[10px] font-medium text-slate-400 truncate mt-0.5">
                {profile?.disetujuiTitle || "Dept Head"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
