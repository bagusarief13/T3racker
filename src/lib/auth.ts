import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "t3racker-secret-key-2026-sdd-bni"
);
const TOKEN_COOKIE_NAME = "t3racker_session";

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function signSessionToken(userId: string): Promise<string> {
  return await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return (payload.sub as string) || null;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  try {
    // 1. Check Clerk session first
    try {
      const { userId: clerkUserId } = await auth();
      if (clerkUserId) {
        // Find existing user by clerkId or id
        let user = await (prisma.user as any).findFirst({
          where: {
            OR: [{ clerkId: clerkUserId }, { id: clerkUserId }],
          },
          include: { profile: true },
        });

        if (user) {
          return user;
        }

        // If not found by ID, get Clerk user info to link or create
        const clerkUser = await currentUser();
        const primaryEmail =
          clerkUser?.emailAddresses?.[0]?.emailAddress || `${clerkUserId}@clerk.local`;

        // Check if an unlinked existing account with this exact email can be linked
        user = await (prisma.user as any).findFirst({
          where: {
            email: primaryEmail,
            clerkId: null,
          },
          include: { profile: true },
        });

        if (user) {
          user = await (prisma.user as any).update({
            where: { id: user.id },
            data: { clerkId: clerkUserId },
            include: { profile: true },
          });
          return user;
        }

        // Otherwise create a new user & profile
        const fullName =
          [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") ||
          clerkUser?.username ||
          "User";

        user = await (prisma.user as any).create({
          data: {
            id: clerkUserId,
            clerkId: clerkUserId,
            username: clerkUser?.username || primaryEmail.split("@")[0] || clerkUserId,
            email: primaryEmail,
            password: "",
            profile: {
              create: {
                nama: fullName,
                pemohonName: fullName,
                npp: "",
                staffId: "",
                divisi: "",
                departemen: "",
                kelompok: "",
                defaultProject: "",
                defaultProjectCode: "",
                defaultAipFitur: "",
                pemohonTitle: "Karyawan YBS",
                diperiksaName: "",
                diperiksaTitle: "Team Leader",
                disetujuiName: "",
                disetujuiTitle: "Dept Head",
                location: "Jakarta",
                vendor: "sdd",
                standardCheckIn: "08:30",
                standardCheckOut: "17:00",
                estOvertimeStart: "17:00",
                estOvertimeEnd: "20:00",
              },
            },
          },
          include: { profile: true },
        });

        return user;
      }
    } catch (clerkErr) {
      console.warn("Clerk auth check error:", clerkErr);
    }

    // 2. Fall back to legacy cookie authentication
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;
    if (token) {
      const userId = await verifySessionToken(token);
      if (userId) {
        return await prisma.user.findUnique({
          where: { id: userId },
          include: { profile: true },
        });
      }
    }

    return null;
  } catch (error) {
    console.error("Failed to get current user:", error);
    return null;
  }
}

export { TOKEN_COOKIE_NAME };

