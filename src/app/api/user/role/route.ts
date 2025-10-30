import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import UserProfile from "@/lib/models/UserProfile";
import { getUserWithRole } from "@/lib/auth";

const allowedRoles = ["candidate", "recruiter"] as const;

type AllowedRole = typeof allowedRoles[number];

export async function GET(req: NextRequest) {
  try {
    const user = await getUserWithRole(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    return NextResponse.json({ role: user.role, userId: user.userId });
  } catch (error: unknown) {
    console.error("Error getting user role:", error);
    const message = error instanceof Error ? error.message : "Failed to get user role";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getUserWithRole(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const role: string | undefined = body?.role;

    if (!role || !allowedRoles.includes(role as AllowedRole)) {
      return NextResponse.json(
        { error: "Invalid role. Allowed: 'candidate' or 'recruiter'" },
        { status: 400 }
      );
    }

    await connectDB();
    const updated = await UserProfile.findOneAndUpdate(
      { userId: user.userId },
      { role },
      { upsert: true, new: true }
    ).lean();

    return NextResponse.json({ success: true, profile: updated });
  } catch (error: unknown) {
    console.error("Error updating user role:", error);
    const message = error instanceof Error ? error.message : "Failed to update role";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
