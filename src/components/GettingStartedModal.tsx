"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Building,
  User,
  Clock,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  PenTool,
  Check,
} from "lucide-react";
import { BNI_VENDORS } from "@/lib/vendors";
import { ProfileData } from "./SettingsModal";
import { TimeInput } from "./TimeInput";

interface GettingStartedModalProps {
  isOpen: boolean;
  profile: ProfileData | null;
  onClose: () => void;
  onSave: (updatedProfile: ProfileData) => Promise<void>;
}

export const GettingStartedModal: React.FC<GettingStartedModalProps> = ({
  isOpen,
  profile,
  onClose,
  onSave,
}) => {
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<ProfileData>({
    nama: "Bagus Arief Maulana",
    npp: "901707",
    staffId: "K-2514",
    divisi: "RDL",
    departemen: "REL",
    kelompok: "CLD",
    defaultProject: "Collection",
    defaultProjectCode: "",
    defaultAipFitur: "",
    pemohonName: "Bagus Arief Maulana",
    pemohonTitle: "Karyawan YBS",
    diperiksaName: "Hermawan Tri Rosanja",
    diperiksaTitle: "Team Leader",
    disetujuiName: "Syaiful Effendi",
    disetujuiTitle: "Dept Head",
    location: "Jakarta",
    vendor: "sdd",
    standardCheckIn: "08:30",
    standardCheckOut: "17:00",
    estOvertimeStart: "17:00",
    estOvertimeEnd: "20:00",
    hasSeenGettingStarted: false,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        ...profile,
        vendor: profile.vendor || "sdd",
        location: profile.location || "Jakarta",
        standardCheckIn: profile.standardCheckIn || "08:30",
        standardCheckOut: profile.standardCheckOut || "17:00",
        estOvertimeStart: profile.estOvertimeStart || "17:00",
        estOvertimeEnd: profile.estOvertimeEnd || "20:00",
        hasSeenGettingStarted: Boolean(profile.hasSeenGettingStarted),
      });
    }
  }, [profile]);

  if (!isOpen) return null;

  // Handle "Konfigurasi Nanti" / Skip
  const handleSkipForNow = async () => {
    setIsSubmitting(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("t3racker_seen_getting_started", "true");
    }
    try {
      await onSave({
        ...formData,
        hasSeenGettingStarted: true,
      });
      onClose();
    } catch (err) {
      console.error("Failed to dismiss getting started:", err);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle final finish
  const handleFinish = async () => {
    setIsSubmitting(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("t3racker_seen_getting_started", "true");
    }
    try {
      await onSave({
        ...formData,
        hasSeenGettingStarted: true,
      });
      onClose();
    } catch (err) {
      console.error("Failed to save getting started settings:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsInfo = [
    { id: 1, label: "Mitra Vendor", icon: Building },
    { id: 2, label: "Data Pegawai", icon: User },
    { id: 3, label: "Approver & Jam", icon: Clock },
    { id: 4, label: "Siap Digunakan", icon: CheckCircle2 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200 flex flex-col max-h-[92vh]">
        {/* Top Header with Progress */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md text-white font-black text-sm">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold tracking-tight">
                    Panduan Awal T3racker
                  </h3>
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-100">
                    Langkah {step} dari 4
                  </span>
                </div>
                <p className="text-xs text-blue-100/90 mt-0.5">
                  Pengaturan awal untuk memudahkan pengisian timesheet & dokumen lembur Anda
                </p>
              </div>
            </div>
            <button
              onClick={handleSkipForNow}
              className="rounded-xl p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition"
              title="Atur Nanti"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Stepper Dots / Bars */}
          <div className="mt-4 flex items-center gap-2">
            {stepsInfo.map((s) => (
              <div
                key={s.id}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  s.id <= step ? "bg-white" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* STEP 1: PILIH MITRA VENDOR */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="rounded-2xl bg-blue-50/70 border border-blue-100 p-4">
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wide flex items-center gap-1.5">
                  <Building className="h-4 w-4 text-blue-600" />
                  Pilih Mitra Vendor Pengontrak
                </h4>
                <p className="mt-1 text-xs text-blue-700 leading-relaxed">
                  Pilihlah perusahaan mitra tempat Anda bernaung. Template kop surat, logo, dan format dokumen ekspor SPKL akan otomatis disesuaikan dengan mitra pilihan Anda.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {BNI_VENDORS.map((v) => {
                  const isSelected = (formData.vendor || "sdd").toLowerCase() === v.id.toLowerCase();
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, vendor: v.id })}
                      className={`flex items-center gap-3.5 p-3.5 rounded-2xl border text-left transition relative cursor-pointer ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/25 shadow-sm"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200/80 p-1.5 shadow-2xs">
                        <img
                          src={v.logo}
                          alt={v.name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-900 truncate">
                            {v.shortName}
                          </span>
                          {isSelected && (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                              <Check className="h-3 w-3 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {v.legalName}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: IDENTITAS PEGAWAI */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="rounded-2xl bg-indigo-50/70 border border-indigo-100 p-4">
                <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wide flex items-center gap-1.5">
                  <User className="h-4 w-4 text-indigo-600" />
                  Identitas Pegawai di BNI
                </h4>
                <p className="mt-1 text-xs text-indigo-700 leading-relaxed">
                  Informasi ini akan terisi otomatis di header timesheet bulanan dan lembar SPKL, sehingga Anda tidak perlu mengisinya secara manual lagi.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">
                    Nama Lengkap Anda
                  </label>
                  <input
                    type="text"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Contoh: Bagus Arief Maulana"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">
                    NPP BNI
                  </label>
                  <input
                    type="text"
                    value={formData.npp}
                    onChange={(e) => setFormData({ ...formData, npp: e.target.value })}
                    placeholder="Contoh: 901707"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-mono text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">
                    Staff ID (BNI)
                  </label>
                  <input
                    type="text"
                    value={formData.staffId}
                    onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                    placeholder="Contoh: K-2514"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-mono text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">
                    Divisi
                  </label>
                  <input
                    type="text"
                    value={formData.divisi}
                    onChange={(e) => setFormData({ ...formData, divisi: e.target.value })}
                    placeholder="Contoh: RDL"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">
                    Departemen
                  </label>
                  <input
                    type="text"
                    value={formData.departemen}
                    onChange={(e) => setFormData({ ...formData, departemen: e.target.value })}
                    placeholder="Contoh: REL"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">
                    Kelompok
                  </label>
                  <input
                    type="text"
                    value={formData.kelompok}
                    onChange={(e) => setFormData({ ...formData, kelompok: e.target.value })}
                    placeholder="Contoh: CLD"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">
                    Default Project
                  </label>
                  <input
                    type="text"
                    value={formData.defaultProject}
                    onChange={(e) => setFormData({ ...formData, defaultProject: e.target.value })}
                    placeholder="Contoh: Collection"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: APPROVER & JAM KERJA */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="rounded-2xl bg-emerald-50/70 border border-emerald-100 p-4">
                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wide flex items-center gap-1.5">
                  <PenTool className="h-4 w-4 text-emerald-600" />
                  Daftar Approver & Jam Kerja Standar
                </h4>
                <p className="mt-1 text-xs text-emerald-700 leading-relaxed">
                  Nama atasan langsung (Team Leader) dan Dept Head untuk kolom tanda tangan lembar SPKL, serta jam kerja standar Anda.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">
                    Diperiksa Oleh (Team Leader)
                  </label>
                  <input
                    type="text"
                    value={formData.diperiksaName}
                    onChange={(e) => setFormData({ ...formData, diperiksaName: e.target.value })}
                    placeholder="Contoh: Hermawan Tri Rosanja"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">
                    Disetujui Oleh (Dept Head)
                  </label>
                  <input
                    type="text"
                    value={formData.disetujuiName}
                    onChange={(e) => setFormData({ ...formData, disetujuiName: e.target.value })}
                    placeholder="Contoh: Syaiful Effendi"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">
                    Jam Masuk Standar
                  </label>
                  <TimeInput
                    value={formData.standardCheckIn}
                    onChange={(val) => setFormData({ ...formData, standardCheckIn: val })}
                    placeholder="08:30"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-mono text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">
                    Jam Pulang Standar
                  </label>
                  <TimeInput
                    value={formData.standardCheckOut}
                    onChange={(val) => setFormData({ ...formData, standardCheckOut: val })}
                    placeholder="17:00"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-mono text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SELESAI & SIAP DIGUNAKAN */}
          {step === 4 && (
            <div className="text-center py-4 space-y-4 animate-in fade-in duration-150">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-md shadow-emerald-500/15">
                <CheckCircle2 className="h-9 w-9 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Pengaturan Anda Siap Digunakan! 🎉
                </h3>
                <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Timesheet dan form dokumen lembur Anda kini akan otomatis terisi dengan data profil dan mitra yang telah Anda tetapkan.
                </p>
              </div>

              {/* Summary Card */}
              <div className="rounded-2xl border border-slate-200/90 bg-slate-50 p-4 text-left max-w-md mx-auto space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Nama:</span>
                  <span className="text-slate-800 font-bold">{formData.nama || "-"}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">NPP / Staff ID:</span>
                  <span className="text-slate-800 font-mono font-bold">
                    {formData.npp || "-"} / {formData.staffId || "-"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Mitra Pengontrak:</span>
                  <span className="text-blue-700 font-bold uppercase">{formData.vendor || "sdd"}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Atasan / Dept Head:</span>
                  <span className="text-slate-800 font-medium">
                    {formData.diperiksaName || "-"} / {formData.disetujuiName || "-"}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                Anda dapat mengubah pengaturan ini kapan saja melalui menu <strong>Pengaturan</strong> di pojok kanan atas.
              </p>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/70">
          <div>
            <button
              type="button"
              onClick={handleSkipForNow}
              disabled={isSubmitting}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition underline underline-offset-4 cursor-pointer"
            >
              Atur Nanti Saja
            </button>
          </div>

          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                disabled={isSubmitting}
                className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Sebelumnya</span>
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition cursor-pointer"
              >
                <span>Lanjut</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition disabled:opacity-50 cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>{isSubmitting ? "Menyimpan..." : "Mulai Gunakan T3racker"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
