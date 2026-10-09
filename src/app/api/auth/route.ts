import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, comparePassword, signSessionToken, getCurrentUser, TOKEN_COOKIE_NAME } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null });
  }

  const { password, ...safeUser } = user;
  return NextResponse.json({ user: safeUser });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, username, email, password } = body;

    if (action === "logout") {
      const response = NextResponse.json({ success: true });
      response.cookies.delete(TOKEN_COOKIE_NAME);
      return response;
    }

    if (action === "register") {
      if (!username || !password || !email) {
        return NextResponse.json(
          { error: "Username, email, dan password wajib diisi." },
          { status: 400 }
        );
      }

      // Check existing
      const existing = await prisma.user.findFirst({
        where: { OR: [{ username }, { email }] },
      });

      if (existing) {
        return NextResponse.json(
          { error: "Username atau email sudah digunakan." },
          { status: 400 }
        );
      }

      const hashedPassword = await hashPassword(password);
      const user = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          profile: {
            create: {
              nama: username === "bagus" ? "Bagus Arief Maulana" : username,
              npp: username === "bagus" ? "901707" : "",
              staffId: username === "bagus" ? "K-2514" : "",
              divisi: "RDL",
              departemen: "REL",
              kelompok: "CLD",
              defaultProject: "Collection",
              pemohonName: username === "bagus" ? "Bagus Arief Maulana" : username,
              diperiksaName: "Hermawan Tri Rosanja",
              disetujuiName: "Syaiful Effendi",
            },
          },
        },
      });

      const token = await signSessionToken(user.id);
      const response = NextResponse.json({
        success: true,
        user: { id: user.id, username: user.username, email: user.email },
      });

      response.cookies.set({
        name: TOKEN_COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });

      return response;
    }

    // Action: login
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username/Email dan password harus diisi." },
        { status: 400 }
      );
    }

    // Try finding by username or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email: username }],
      },
      include: { profile: true },
    });

    if (!user) {
      // For convenience during initial setup, if no users exist in database yet, auto-create admin/user!
      const userCount = await prisma.user.count();
      if (userCount === 0) {
        const hashedPassword = await hashPassword(password);
        const newUser = await prisma.user.create({
          data: {
            username,
            email: `${username}@bni.co.id`,
            password: hashedPassword,
            profile: {
              create: {
                nama: "Bagus Arief Maulana",
                npp: "901707",
                staffId: "K-2514",
                divisi: "RDL",
                departemen: "REL",
                kelompok: "CLD",
                defaultProject: "Collection",
                pemohonName: "Bagus Arief Maulana",
                diperiksaName: "Hermawan Tri Rosanja",
                disetujuiName: "Syaiful Effendi",
              },
            },
          },
          include: { profile: true },
        });

        const token = await signSessionToken(newUser.id);
        const response = NextResponse.json({
          success: true,
          user: { id: newUser.id, username: newUser.username, profile: newUser.profile },
        });
        response.cookies.set({
          name: TOKEN_COOKIE_NAME,
          value: token,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 30 * 24 * 60 * 60,
          path: "/",
        });
        return response;
      }

      return NextResponse.json(
        { error: "Username atau password salah." },
        { status: 401 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { error: "Akun ini terdaftar via Clerk / Google. Silakan login menggunakan tombol Sign In Clerk." },
        { status: 400 }
      );
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Username atau password salah." },
        { status: 401 }
      );
    }

    const token = await signSessionToken(user.id);
    const response = NextResponse.json({
      success: true,
      user: { id: user.id, username: user.username, profile: user.profile },
    });

    response.cookies.set({
      name: TOKEN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err: unknown) {
    console.error("Auth error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
