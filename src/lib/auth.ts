import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { connectDB } from "./db";
import UserProfile from "./models/UserProfile";

// Get user with role information
export async function getUserWithRole(req: NextRequest): Promise<{ userId: string; role: string } | null> {
  const { userId } = getAuth(req);

  if (!userId) {
    return null;
  }

  await connectDB();

  // Find or create user profile
  let userProfile = await UserProfile.findOne({ userId });

  // If no profile exists yet, create a default one as candidate
  if (!userProfile) {
    userProfile = await UserProfile.create({
      userId,
      role: "candidate"
    });
  }

  return {
    userId,
    role: userProfile.role
  };
}

// Authentication helpers that return user object or NextResponse error
export async function requireRecruiterUser(req: NextRequest) {
  const user = await getUserWithRole(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "recruiter") return NextResponse.json({ error: "Forbidden: Recruiter access required" }, { status: 403 });
  return user; // { userId, role }
}

export async function requireCandidateUser(req: NextRequest) {
  const user = await getUserWithRole(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "candidate") return NextResponse.json({ error: "Forbidden: Candidate access required" }, { status: 403 });
  return user; // { userId, role }
}