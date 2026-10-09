"use client";

import React, { useState, useEffect } from "react";
import { X, CalendarDays, Plus, Trash2, RefreshCw } from "lucide-react";

interface HolidayModalProps {
  isOpen: boolean;
  year: number;
  onClose: () => void;
  onHolidayUpdated: () => void;
}

export const HolidayModal: React.FC<HolidayModalProps> = ({
  isOpen,
  year,
  onClose,
  onHolidayUpdated,
}) => {
  const [nationalHolidays, setNationalHolidays] = useState<Record<string, string>>({});
  const [overrides, setOverrides] = useState<Record<string, { name: string; isHoliday: boolean }>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newName, setNewName] = useState("");

  const loadHolidays = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/holidays?year=${year}`);
      if (res.ok) {
        const data = await res.json();
        setNationalHolidays(data.nationalHolidays || {});
        setOverrides(data.overrides || {});
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadHolidays();
    }
  }, [isOpen, year]);

  if (!isOpen) return null;

  const handleAddOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newName) return;

    try {
      const res = await fetch("/api/holidays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateStr: newDate,
          name: newName,
          isHoliday: true,
        }),
      });
      if (res.ok) {
        setNewDate("");
        setNewName("");
        await loadHolidays();
        onHolidayUpdated();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteOverride = async (dateStr: string) => {
    try {
      const res = await fetch("/api/holidays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dateStr, action: "delete" }),
      });
      if (res.ok) {
        await loadHolidays();
        onHolidayUpdated();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Combine list
  const allDates = Array.from(
    new Set([...Object.keys(nationalHolidays), ...Object.keys(overrides)])
  ).sort();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600 text-white">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Daftar Hari Libur Nasional & Custom ({year})
              </h3>
              <p className="text-xs text-slate-500">
                Otomatis mendeteksi libur nasional dan memungkinkan penambahan libur khusus
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

        <div className="p-6 space-y-5">
          {/* Add Custom Holiday */}
          <form
            onSubmit={handleAddOverride}
            className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3"
          >
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Tambah Libur / Cuti Bersama Perusahaan
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                required
              />
              <input
                type="text"
                placeholder="Nama Hari Libur / Cuti Bersama..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tambahkan</span>
              </button>
            </div>
          </form>

          {/* Holiday List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Hari Libur Terdaftar ({allDates.length})
              </label>
              <button
                type="button"
                onClick={loadHolidays}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
              >
                <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
                <span>Muat Ulang</span>
              </button>
            </div>

            <div className="max-h-[42vh] overflow-y-auto divide-y divide-slate-100 rounded-xl border border-slate-200">
              {allDates.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  Tidak ada data hari libur untuk tahun ini.
                </div>
              ) : (
                allDates.map((dateStr) => {
                  const isCustom = overrides[dateStr] !== undefined;
                  const name = isCustom
                    ? overrides[dateStr].name
                    : nationalHolidays[dateStr];

                  return (
                    <div
                      key={dateStr}
                      className="flex items-center justify-between p-3 hover:bg-slate-50 transition text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-slate-700">
                          {dateStr}
                        </span>
                        <span className="font-medium text-slate-900">{name}</span>
                        {isCustom ? (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                            Custom
                          </span>
                        ) : (
                          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800">
                            Nasional
                          </span>
                        )}
                      </div>

                      {isCustom && (
                        <button
                          type="button"
                          onClick={() => handleDeleteOverride(dateStr)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded"
                          title="Hapus Libur Kustom"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end border-t border-slate-100 bg-slate-50/80 px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
