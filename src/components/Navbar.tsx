"use client";

import React from "react";
import {
  Settings,
  CalendarDays,
  UserCheck,
  Compass,
} from "lucide-react";
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import { ProfileData, SettingsFormContent } from "./SettingsModal";

interface NavbarProps {
  profile: ProfileData | null;
  onOpenSettings: () => void;
  onOpenHolidays: () => void;
  onOpenGettingStarted: () => void;
  onSaveProfile: (updatedProfile: ProfileData) => Promise<void>;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  onOpenSettings,
  onOpenHolidays,
  onOpenGettingStarted,
  onSaveProfile,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="T3racker Logo"
            className="h-10 w-10 rounded-xl shadow-md shadow-cyan-600/20 object-contain"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                T3racker
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500">
              Timesheet Task & Overtime Tracker
            </p>
          </div>
        </div>

        {/* User profile & Actions */}
        <div className="flex items-center gap-2">
          {/* Holidays Button */}
          <button
            onClick={onOpenHolidays}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-red-600 cursor-pointer"
            title="Kelola Hari Libur Nasional & Custom"
          >
            <CalendarDays className="h-3.5 w-3.5 text-red-500" />
            <span className="hidden sm:inline">Hari Libur</span>
          </button>

          {/* Clerk Auth Controls */}
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-blue-600 cursor-pointer">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-blue-700 cursor-pointer">
                Sign Up
              </button>
            </SignUpButton>
          </Show>

          <Show when="signed-in">
            {profile && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="hidden items-center gap-2 rounded-lg border border-slate-200/80 bg-slate-50 px-2.5 py-1 md:flex hover:bg-slate-100/80 hover:border-slate-300 transition text-left cursor-pointer"
                title="Buka Pengaturan Akun & Profil"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs">
                  <UserCheck className="h-3.5 w-3.5" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold text-slate-800 leading-tight">
                    {profile.nama || "User"}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    NPP: {profile.npp || "-"} • {profile.departemen || "Atur Profil"}
                  </div>
                </div>
              </button>
            )}
            <div className="flex items-center pl-1">
              <UserButton
                appearance={{
                  elements: {
                    userButtonPopoverActionButton__manageAccount: "hidden",
                  },
                }}
              >
                <UserButton.UserProfilePage
                  label="Pengaturan"
                  url="pengaturan"
                  labelIcon={<Settings className="h-4 w-4" />}
                >
                  <SettingsFormContent
                    profile={profile}
                    onSave={onSaveProfile}
                    onOpenGettingStarted={onOpenGettingStarted}
                  />
                </UserButton.UserProfilePage>
                <UserButton.MenuItems>
                  <UserButton.Action
                    label="Pengaturan"
                    labelIcon={<Settings className="h-4 w-4" />}
                    onClick={onOpenSettings}
                  />
                  <UserButton.Action
                    label="Panduan Awal (Getting Started)"
                    labelIcon={<Compass className="h-4 w-4 text-blue-600" />}
                    onClick={onOpenGettingStarted}
                  />
                </UserButton.MenuItems>
              </UserButton>
            </div>
          </Show>
        </div>
      </div>
    </header>
  );
};
