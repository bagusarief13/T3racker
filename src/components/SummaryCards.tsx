"use client";

import React from "react";
import {
  UserCheck2,
  CalendarOff,
  AlertCircle,
  ThermometerSnowflake,
  Flame,
  Clock,
} from "lucide-react";
import { minutesToHHmm } from "@/lib/time-calc";

interface SummaryCardsProps {
  stats: {
    hadir: number;
    cuti: number;
    izin: number;
    sakit: number;
    lembur: number;
    totalMinutes: number;
    totalDays: number;
  };
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ stats }) => {
  const totalHoursFormatted = minutesToHHmm(stats.totalMinutes);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {/* Hadir */}
      <div className="flex items-center gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-3 shadow-xs transition hover:shadow-sm">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-xs">
          <UserCheck2 className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
            Hadir (H)
          </div>
          <div className="text-xl font-black text-emerald-950">
            {stats.hadir}{" "}
            <span className="text-xs font-normal text-emerald-700">hari</span>
          </div>
        </div>
      </div>

      {/* Cuti */}
      <div className="flex items-center gap-3 rounded-xl border border-sky-200/80 bg-sky-50/50 p-3 shadow-xs transition hover:shadow-sm">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500 text-white shadow-xs">
          <CalendarOff className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[11px] font-semibold text-sky-800 uppercase tracking-wider">
            Cuti (C)
          </div>
          <div className="text-xl font-black text-sky-950">
            {stats.cuti}{" "}
            <span className="text-xs font-normal text-sky-700">hari</span>
          </div>
        </div>
      </div>

      {/* Izin */}
      <div className="flex items-center gap-3 rounded-xl border border-amber-200/80 bg-amber-50/50 p-3 shadow-xs transition hover:shadow-sm">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500 text-white shadow-xs">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
            Izin (I)
          </div>
          <div className="text-xl font-black text-amber-950">
            {stats.izin}{" "}
            <span className="text-xs font-normal text-amber-700">hari</span>
          </div>
        </div>
      </div>

      {/* Sakit */}
      <div className="flex items-center gap-3 rounded-xl border border-rose-200/80 bg-rose-50/50 p-3 shadow-xs transition hover:shadow-sm">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500 text-white shadow-xs">
          <ThermometerSnowflake className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider">
            Sakit (S)
          </div>
          <div className="text-xl font-black text-rose-950">
            {stats.sakit}{" "}
            <span className="text-xs font-normal text-rose-700">hari</span>
          </div>
        </div>
      </div>

      {/* Lembur (L) - highlighted */}
      <div className="flex items-center gap-3 rounded-xl border border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50 p-3 shadow-xs transition hover:shadow-sm ring-1 ring-orange-400/30">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-sm shadow-orange-500/30">
          <Flame className="h-5 w-5 animate-pulse" />
        </div>
        <div>
          <div className="text-[11px] font-bold text-orange-900 uppercase tracking-wider">
            Lembur (L)
          </div>
          <div className="text-xl font-black text-orange-950">
            {stats.lembur}{" "}
            <span className="text-xs font-normal text-orange-800">hari</span>
          </div>
        </div>
      </div>

      {/* Total Jam Kerja */}
      <div className="flex items-center gap-3 rounded-xl border border-indigo-200/80 bg-indigo-50/50 p-3 shadow-xs transition hover:shadow-sm">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
          <Clock className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[11px] font-semibold text-indigo-900 uppercase tracking-wider">
            Total Jam Kerja
          </div>
          <div className="text-xl font-black text-indigo-950">
            {totalHoursFormatted}{" "}
            <span className="text-xs font-normal text-indigo-700">jam</span>
          </div>
        </div>
      </div>
    </div>
  );
};
