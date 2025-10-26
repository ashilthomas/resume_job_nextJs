import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import UserProfile from "@/lib/models/UserProfile";
import { getUserWithRole } from "@/lib/auth";

const allowedRoles = ["candidate", "recruiter"] as const;

type AllowedRole = typeof allowedRoles[number];

export async function GET(req: NextRequest) {
  try {
    const user = await getUserWithRole(req);
    if (user instanceof NextResponse) return user;

    return NextResponse.json({ role: user.role, userId: user.userId });
  } catch (error: any) {
    console.error("Error getting user role:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get user role" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getUserWithRole(req);
    if (user instanceof NextResponse) return user;

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
  } catch (error: any) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update role" },
      { status: 500 }
    );
  }
}