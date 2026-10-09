import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  return NextResponse.json({
    profile: profile || null,
  });
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    const updated = await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        nama: data.nama,
        npp: data.npp,
        staffId: data.staffId,
        divisi: data.divisi,
        departemen: data.departemen,
        kelompok: data.kelompok,
        defaultProject: data.defaultProject,
        defaultProjectCode: data.defaultProjectCode,
        defaultAipFitur: data.defaultAipFitur,
        pemohonName: data.pemohonName,
        pemohonTitle: data.pemohonTitle,
        diperiksaName: data.diperiksaName,
        diperiksaTitle: data.diperiksaTitle,
        disetujuiName: data.disetujuiName,
        disetujuiTitle: data.disetujuiTitle,
        location: data.location,
        vendor: data.vendor || "sdd",
        standardCheckIn: data.standardCheckIn,
        standardCheckOut: data.standardCheckOut,
        estOvertimeStart: data.estOvertimeStart,
        estOvertimeEnd: data.estOvertimeEnd,
        ...(data.hasSeenGettingStarted !== undefined
          ? { hasSeenGettingStarted: Boolean(data.hasSeenGettingStarted) }
          : {}),
      },
      create: {
        userId: user.id,
        nama: data.nama || "",
        npp: data.npp || "",
        staffId: data.staffId || "",
        divisi: data.divisi || "",
        departemen: data.departemen || "",
        kelompok: data.kelompok || "",
        defaultProject: data.defaultProject || "",
        defaultProjectCode: data.defaultProjectCode || "",
        defaultAipFitur: data.defaultAipFitur || "",
        pemohonName: data.pemohonName || "",
        diperiksaName: data.diperiksaName || "",
        disetujuiName: data.disetujuiName || "",
        location: data.location || "Jakarta",
        vendor: data.vendor || "sdd",
        standardCheckIn: data.standardCheckIn || "08:30",
        standardCheckOut: data.standardCheckOut || "17:00",
        estOvertimeStart: data.estOvertimeStart || "17:00",
        estOvertimeEnd: data.estOvertimeEnd || "20:00",
        hasSeenGettingStarted: Boolean(data.hasSeenGettingStarted),
      },
    });

    return NextResponse.json({
      success: true,
      profile: updated,
    });
  } catch (error) {
    console.error("Failed to update profile:", error);
    return NextResponse.json({ error: "Gagal menyimpan profil." }, { status: 500 });
  }
}
