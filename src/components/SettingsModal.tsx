"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Settings,
  Check,
} from "lucide-react";
import { UserProfile } from "@clerk/nextjs";
import { BNI_VENDORS } from "@/lib/vendors";
import { TimeInput } from "./TimeInput";

export interface ProfileData {
  nama: string;
  npp: string;
  staffId: string;
  divisi: string;
  departemen: string;
  kelompok: string;
  defaultProject: string;
  defaultProjectCode: string;
  defaultAipFitur: string;
  pemohonName: string;
  pemohonTitle: string;
  diperiksaName: string;
  diperiksaTitle: string;
  disetujuiName: string;
  disetujuiTitle: string;
  location: string;
  vendor?: string;
  standardCheckIn: string;
  standardCheckOut: string;
  estOvertimeStart: string;
  estOvertimeEnd: string;
  hasSeenGettingStarted?: boolean;
}

interface SettingsFormContentProps {
  profile: ProfileData | null;
  onSave: (updatedProfile: ProfileData) => Promise<void>;
  onOpenGettingStarted?: () => void;
  onClose?: () => void;
}

export const SettingsFormContent: React.FC<SettingsFormContentProps> = ({
  profile,
  onSave,
  onOpenGettingStarted,
  onClose,
}) => {
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

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-1 py-1 space-y-5">
      {/* Header - Styled to match Clerk's Profile & Security header */}
      <div className="pb-3 border-b border-slate-200/80">
        <h2 className="text-base font-semibold text-slate-900">
          Pengaturan
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Kelola profil pegawai BNI, approver, jam kerja, dan mitra vendor Anda.
        </p>
      </div>

      {/* Row 1: Panduan Awal (Getting Started) */}
      <div className="pb-4 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-800">
              Panduan Awal (Getting Started)
            </span>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                formData.hasSeenGettingStarted
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200/70"
                  : "bg-amber-50 text-amber-700 border-amber-200/70"
              }`}
            >
              {formData.hasSeenGettingStarted ? "Selesai" : "Belum selesai"}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Panduan interaktif langkah demi langkah untuk konfigurasi awal pegawai dan approver.
          </p>
        </div>
        {onOpenGettingStarted && (
          <button
            type="button"
            onClick={onOpenGettingStarted}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition cursor-pointer shrink-0 self-start sm:self-center"
          >
            Buka Panduan
          </button>
        )}
      </div>

      {/* Section 2: Mitra Vendor Pengontrak */}
      <div className="pb-5 border-b border-slate-200/80 space-y-2.5">
        <div>
          <h3 className="text-xs font-semibold text-slate-800">
            Mitra Vendor Pengontrak
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Menentukan kop surat dan logo pada lembar form lembur (SPKL) & timesheet bulanan.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
          {BNI_VENDORS.map((v) => {
            const isSelected = (formData.vendor || "sdd").toLowerCase() === v.id.toLowerCase();
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setFormData({ ...formData, vendor: v.id })}
                className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition cursor-pointer ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600 text-blue-950"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70 text-slate-800"
                }`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white border border-slate-200/80 p-1">
                  <img
                    src={v.logo}
                    alt={v.shortName}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold truncate leading-tight">
                      {v.shortName}
                    </span>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-blue-600 stroke-[2.5]" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {v.tagline || v.legalName}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 3: Data Identitas Pegawai */}
      <div className="pb-5 border-b border-slate-200/80 space-y-3">
        <div>
          <h3 className="text-xs font-semibold text-slate-800">
            Identitas Pegawai
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Informasi otomatis yang dicetak pada header timesheet dan formulir absensi.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-slate-600 mb-1 block">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">
              NPP BNI
            </label>
            <input
              type="text"
              value={formData.npp}
              onChange={(e) => setFormData({ ...formData, npp: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-mono text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">
              Staff ID (BNI)
            </label>
            <input
              type="text"
              value={formData.staffId}
              onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-mono text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">
              Divisi
            </label>
            <input
              type="text"
              value={formData.divisi}
              onChange={(e) => setFormData({ ...formData, divisi: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">
              Departemen
            </label>
            <input
              type="text"
              value={formData.departemen}
              onChange={(e) => setFormData({ ...formData, departemen: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">
              Kelompok
            </label>
            <input
              type="text"
              value={formData.kelompok}
              onChange={(e) => setFormData({ ...formData, kelompok: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">
              Default Project
            </label>
            <input
              type="text"
              value={formData.defaultProject}
              onChange={(e) => setFormData({ ...formData, defaultProject: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-slate-600 mb-1 block">
              Kota Penandatanganan
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition"
            />
          </div>
        </div>
      </div>

      {/* Section 4: Approver & Tanda Tangan */}
      <div className="pb-5 border-b border-slate-200/80 space-y-3">
        <div>
          <h3 className="text-xs font-semibold text-slate-800">
            Daftar Approver (Tanda Tangan Dokumen)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Nama yang dicantumkan pada kolom tanda tangan formulir lembur (SPKL) BNI & vendor.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-0.5">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">
              Pemohon (Karyawan YBS)
            </label>
            <input
              type="text"
              value={formData.pemohonName}
              onChange={(e) => setFormData({ ...formData, pemohonName: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">
              Diperiksa (Team Leader)
            </label>
            <input
              type="text"
              value={formData.diperiksaName}
              onChange={(e) => setFormData({ ...formData, diperiksaName: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">
              Disetujui (Dept Head)
            </label>
            <input
              type="text"
              value={formData.disetujuiName}
              onChange={(e) => setFormData({ ...formData, disetujuiName: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition"
            />
          </div>
        </div>
      </div>

      {/* Section 5: Waktu Kerja Standar & Estimasi Lembur */}
      <div className="pb-4 border-b border-slate-200/80 space-y-3">
        <div>
          <h3 className="text-xs font-semibold text-slate-800">
            Waktu Kerja & Estimasi Lembur
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Digunakan sebagai nilai default saat mengisi form lembur dan perhitungan jam kerja.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-0.5">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">
              Masuk Standar
            </label>
            <TimeInput
              value={formData.standardCheckIn}
              onChange={(val) => setFormData({ ...formData, standardCheckIn: val })}
              placeholder="08:30"
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-mono text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">
              Pulang Standar
            </label>
            <TimeInput
              value={formData.standardCheckOut}
              onChange={(val) => setFormData({ ...formData, standardCheckOut: val })}
              placeholder="17:00"
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-mono text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">
              Lembur Mulai
            </label>
            <TimeInput
              value={formData.estOvertimeStart}
              onChange={(val) => setFormData({ ...formData, estOvertimeStart: val })}
              placeholder="20:00"
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-mono text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">
              Lembur Selesai
            </label>
            <TimeInput
              value={formData.estOvertimeEnd}
              onChange={(val) => setFormData({ ...formData, estOvertimeEnd: val })}
              placeholder="22:00"
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-mono text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition"
            />
          </div>
        </div>
      </div>

      {/* Footer Save Button - Styled cleanly to match Clerk buttons */}
      <div className="flex items-center justify-between pt-2">
        <div>
          {saveSuccess && (
            <span className="text-xs font-medium text-emerald-600 flex items-center gap-1.5 animate-in fade-in">
              <Check className="h-4 w-4 stroke-[2.5]" />
              Pengaturan berhasil disimpan
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Tutup
            </button>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow-2xs hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </form>
  );
};

interface SettingsModalProps {
  isOpen: boolean;
  profile: ProfileData | null;
  onClose: () => void;
  onSave: (updatedProfile: ProfileData) => Promise<void>;
  onOpenGettingStarted?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  profile,
  onClose,
  onSave,
  onOpenGettingStarted,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 rounded-xl bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition cursor-pointer"
          title="Tutup"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Clerk UserProfile with Custom Pengaturan Page */}
        <UserProfile routing="hash">
          <UserProfile.Page
            label="Pengaturan"
            url="pengaturan"
            labelIcon={<Settings className="h-4 w-4" />}
          >
            <SettingsFormContent
              profile={profile}
              onSave={onSave}
              onOpenGettingStarted={onOpenGettingStarted}
              onClose={onClose}
            />
          </UserProfile.Page>
        </UserProfile>
      </div>
    </div>
  );
};
