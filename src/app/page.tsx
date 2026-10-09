"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Navbar } from "@/components/Navbar";
import { EmployeeHeaderForm } from "@/components/EmployeeHeaderForm";
import { SummaryCards } from "@/components/SummaryCards";
import { TimesheetCalendar } from "@/components/TimesheetCalendar";
import { DayRecord } from "@/components/TimesheetTable";
import { DayEditModal } from "@/components/DayEditModal";
import { SettingsModal, ProfileData } from "@/components/SettingsModal";
import { GettingStartedModal } from "@/components/GettingStartedModal";
import { HolidayModal } from "@/components/HolidayModal";
import { IhcsImportModal } from "@/components/IhcsImportModal";
import { Upload, FileText, Sparkles } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  // Date state: Default to current month and year when user logs in / opens the app
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);

  const [days, setDays] = useState<DayRecord[]>([]);
  const [timesheetMonthId, setTimesheetMonthId] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Modals state
  const [selectedDay, setSelectedDay] = useState<DayRecord | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGettingStartedOpen, setIsGettingStartedOpen] = useState(false);
  const [isHolidaysOpen, setIsHolidaysOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importInitialFile, setImportInitialFile] = useState<File | null>(null);

  // Global drag-and-drop state
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const dragCounterRef = useRef(0);

  // Debounce ref for auto-saving
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasPromptedSetupRef = useRef(false);

  // Fetch timesheet data
  const loadTimesheet = useCallback(async (y: number, m: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/timesheet?year=${y}&month=${m}`);
      if (res.status === 401) {
        router.push("/sign-in");
        return;
      }
      const data = await res.json();
      if (data.timesheetMonth) {
        setTimesheetMonthId(data.timesheetMonth.id);
        setDays(data.timesheetMonth.days || []);
      }
      if (data.profile) {
        setProfile(data.profile);

        // Auto-show Getting Started modal once per user if not yet completed/seen
        if (!hasPromptedSetupRef.current) {
          hasPromptedSetupRef.current = true;
          const localKey = "t3racker_seen_getting_started";
          const localSeen = typeof window !== "undefined" && localStorage.getItem(localKey) === "true";
          const isSeen = Boolean(data.profile.hasSeenGettingStarted) || localSeen;

          if (!isSeen) {
            setIsGettingStartedOpen(true);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load timesheet:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadTimesheet(year, month);
  }, [year, month, loadTimesheet]);

  // Global window-level drag-and-drop listener for IHCS PDF
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (
        e.dataTransfer &&
        e.dataTransfer.types &&
        Array.from(e.dataTransfer.types).includes("Files")
      ) {
        dragCounterRef.current += 1;
        if (dragCounterRef.current === 1) {
          setIsDraggingFile(true);
        }
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current -= 1;
      if (dragCounterRef.current <= 0) {
        dragCounterRef.current = 0;
        setIsDraggingFile(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "copy";
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current = 0;
      setIsDraggingFile(false);

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        const dropped = files[0];
        if (dropped && dropped.name.toLowerCase().endsWith(".pdf")) {
          setImportInitialFile(dropped);
          setIsImportModalOpen(true);
        } else {
          alert("Harap unggah file dokumen berformat PDF (.pdf) Laporan Kehadiran Karyawan dari portal IHCS.");
        }
      }
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, []);

  // Handle month change
  const handleMonthChange = (newYear: number, newMonth: number) => {
    setYear(newYear);
    setMonth(newMonth);
  };

  // Debounced auto-save to database
  const saveTimesheetToDb = useCallback(
    (updatedDays: DayRecord[]) => {
      if (!timesheetMonthId) return;

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      setIsSaving(true);
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await fetch("/api/timesheet", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              timesheetMonthId,
              days: updatedDays,
            }),
          });
        } catch (err) {
          console.error("Error saving timesheet:", err);
        } finally {
          setIsSaving(false);
        }
      }, 600);
    },
    [timesheetMonthId]
  );

  // Update days from calendar or modals
  const handleUpdateDays = (updatedDays: DayRecord[]) => {
    setDays(updatedDays);
    saveTimesheetToDb(updatedDays);
  };

  // Handle import from IHCS PDF
  const handleImportIhcs = async (
    importedDays: DayRecord[],
    targetYear: number,
    targetMonth: number
  ) => {
    setIsSaving(true);
    try {
      // 1. Ensure timesheet record exists for target year & month
      const res = await fetch(`/api/timesheet?year=${targetYear}&month=${targetMonth}`);
      const data = await res.json();
      const targetMonthRecord = data.timesheetMonth;
      const targetId = targetMonthRecord?.id;

      if (!targetId) {
        throw new Error("Gagal menginisialisasi bulan timesheet.");
      }

      // Merge imported days with DB day records to preserve proper dates, weekends, holidays, and DB IDs
      const targetDbDays: DayRecord[] = targetMonthRecord.days || [];
      const mergedDays: DayRecord[] =
        targetDbDays.length > 0
          ? targetDbDays.map((dbDay) => {
              const imp = importedDays.find((d) => d.day === dbDay.day);
              if (!imp) return dbDay;
              return {
                ...dbDay,
                jamMasuk: imp.jamMasuk,
                jamPulang: imp.jamPulang,
                totalJamKerja: imp.totalJamKerja,
                totalMinutes: imp.totalMinutes,
                statusKehadiran: imp.statusKehadiran,
                isLembur: imp.isLembur,
                kegiatan: imp.kegiatan || dbDay.kegiatan,
                project: imp.project || dbDay.project,
              };
            })
          : importedDays;

      // 2. Persist directly to database
      await fetch("/api/timesheet", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timesheetMonthId: targetId,
          days: mergedDays,
        }),
      });

      // 3. Update view state
      setTimesheetMonthId(targetId);
      setDays(mergedDays);
      setYear(targetYear);
      setMonth(targetMonth);
    } catch (err) {
      console.error("Error importing IHCS timesheet:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Save single day from DayEditModal
  const handleSaveDay = (updatedDay: DayRecord) => {
    const updated = days.map((d) => (d.id === updatedDay.id ? updatedDay : d));
    setDays(updated);
    saveTimesheetToDb(updated);
  };

  // Save profile settings & header form
  const handleSaveProfile = async (updatedProfile: ProfileData) => {
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProfile),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    router.push("/sign-in");
  };

  // Export handlers
  const handleExportExcel = () => {
    window.open(`/api/export/excel?year=${year}&month=${month}`, "_blank");
  };

  const handleExportSddDocx = () => {
    window.open(`/api/export/sdd-docx?year=${year}&month=${month}`, "_blank");
  };

  const handleExportBniDocx = () => {
    window.open(`/api/export/bni-docx?year=${year}&month=${month}`, "_blank");
  };

  // Compute live statistics
  const stats = {
    hadir: days.filter((d) => d.statusKehadiran === "H").length,
    cuti: days.filter((d) => d.statusKehadiran === "C").length,
    izin: days.filter((d) => d.statusKehadiran === "I").length,
    sakit: days.filter((d) => d.statusKehadiran === "S").length,
    lembur: days.filter((d) => d.isLembur).length,
    totalMinutes: days.reduce((acc, cur) => acc + (cur.totalMinutes || 0), 0),
    totalDays: days.length,
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-xs font-medium text-slate-500">Mengarahkan ke halaman login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800">
      {/* Top Header */}
      <Navbar
        profile={profile}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHolidays={() => setIsHolidaysOpen(true)}
        onOpenGettingStarted={() => setIsGettingStartedOpen(true)}
        onSaveProfile={handleSaveProfile}
        onLogout={handleLogout}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-5">
        {/* Section 1: Employee & Organization Info Form (Above the calendar UI) */}
        <EmployeeHeaderForm
          profile={profile}
          year={year}
          month={month}
          onMonthChange={handleMonthChange}
        />

        {/* Section 2: Live Summary Metric Cards */}
        <SummaryCards stats={stats} />

        {/* Section 3: Interactive Calendar Grid */}
        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
              <p className="mt-2 text-xs font-semibold text-slate-500">
                Memuat data timesheet...
              </p>
            </div>
          </div>
        ) : (
          <TimesheetCalendar
            days={days}
            year={year}
            month={month}
            defaultProject={profile?.defaultProject || "Collection"}
            standardIn={profile?.standardCheckIn || "08:30"}
            standardOut={profile?.standardCheckOut || "17:00"}
            vendorId={profile?.vendor || "sdd"}
            isSaving={isSaving}
            onUpdateDays={handleUpdateDays}
            onOpenDayModal={(day) => setSelectedDay(day)}
            onExportExcel={handleExportExcel}
            onExportSddDocx={handleExportSddDocx}
            onExportBniDocx={handleExportBniDocx}
            onOpenImportModal={() => {
              setImportInitialFile(null);
              setIsImportModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Focus Day Edit Modal */}
      <DayEditModal
        day={selectedDay}
        allDays={days}
        isOpen={!!selectedDay}
        standardIn={profile?.standardCheckIn || "08:30"}
        standardOut={profile?.standardCheckOut || "17:00"}
        defaultProject={profile?.defaultProject || "Collection"}
        onClose={() => setSelectedDay(null)}
        onSave={handleSaveDay}
        onSelectDay={(day) => setSelectedDay(day)}
      />

      {/* Settings Modal (Integrated Clerk UserProfile & Pengaturan) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        profile={profile}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveProfile}
        onOpenGettingStarted={() => {
          setIsSettingsOpen(false);
          setIsGettingStartedOpen(true);
        }}
      />

      {/* Getting Started Modal (Guided Onboarding) */}
      <GettingStartedModal
        isOpen={isGettingStartedOpen}
        profile={profile}
        onClose={() => setIsGettingStartedOpen(false)}
        onSave={handleSaveProfile}
      />

      {/* Holidays Modal */}
      <HolidayModal
        isOpen={isHolidaysOpen}
        year={year}
        onClose={() => setIsHolidaysOpen(false)}
        onHolidayUpdated={() => loadTimesheet(year, month)}
      />

      {/* Global Drag & Drop Overlay Visuals */}
      {isDraggingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-md p-6 pointer-events-none transition-all duration-200 animate-in fade-in">
          <div className="relative flex flex-col items-center justify-center w-full max-w-xl h-[380px] rounded-3xl border-3 border-dashed border-blue-400/90 bg-white/95 shadow-2xl p-8 text-center animate-in zoom-in-95 duration-150">
            {/* Glowing background ambient gradient */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 opacity-30 blur-2xl animate-pulse" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 border border-blue-200 text-blue-600 mb-4 shadow-xl shadow-blue-500/20 animate-bounce">
                <Upload className="h-10 w-10 text-blue-600" />
              </div>

              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Lepaskan File PDF IHCS di Sini
              </h2>
              <p className="mt-2 text-xs sm:text-sm font-medium text-slate-600 max-w-md leading-relaxed">
                Sistem akan otomatis membaca & mengisi <strong>Jam Check In</strong>, <strong>Jam Check Out</strong>, dan status kehadiran ke kalender timesheet Anda.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 border border-blue-200/80 text-[11px] font-bold text-blue-700">
                  <FileText className="h-3.5 w-3.5" />
                  Format: Dokumen PDF (.pdf)
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 border border-indigo-200/80 text-[11px] font-bold text-indigo-700">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                  Auto-Detect Bulan & Lembur
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* IHCS PDF Import Modal */}
      <IhcsImportModal
        isOpen={isImportModalOpen}
        initialFile={importInitialFile}
        currentYear={year}
        currentMonth={month}
        existingDays={days}
        standardIn={profile?.standardCheckIn || "08:30"}
        standardOut={profile?.standardCheckOut || "17:00"}
        defaultProject={profile?.defaultProject || "Collection"}
        onClose={() => {
          setIsImportModalOpen(false);
          setImportInitialFile(null);
        }}
        onApplyImport={(importedDays, targetYear, targetMonth) => {
          handleImportIhcs(importedDays, targetYear, targetMonth);
          setIsImportModalOpen(false);
          setImportInitialFile(null);
        }}
      />
    </div>
  );
}
