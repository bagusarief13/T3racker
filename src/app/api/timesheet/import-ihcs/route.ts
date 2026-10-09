import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { parseIhcsPdf } from "@/lib/ihcs-parser";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "File PDF tidak ditemukan dalam permintaan." },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Format file tidak valid. Harap unggah file dokumen PDF (.pdf)." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    const result = await parseIhcsPdf(uint8);

    if (result.days.length === 0) {
      return NextResponse.json(
        {
          error:
            "Tidak ditemukan baris tanggal atau catatan kehadiran yang valid pada file PDF ini. Pastikan file merupakan 'Laporan Kehadiran Karyawan' resmi dari portal IHCS BNI.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("IHCS PDF import error:", error);
    return NextResponse.json(
      {
        error:
          "Terjadi kesalahan saat memproses file PDF: " +
          (error?.message || "Format PDF tidak dapat dibaca."),
      },
      { status: 500 }
    );
  }
}
