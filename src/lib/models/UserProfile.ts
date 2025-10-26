import mongoose, { Schema, Document } from "mongoose";

export interface IUserProfile extends Document {
  userId: string;
  role: "candidate" | "recruiter";
  createdAt: Date;
}

const UserProfileSchema = new Schema<IUserProfile>({
  userId: { type: String, required: true, unique: true },
  role: { type: String, required: true, enum: ["candidate", "recruiter"], default: "candidate" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.UserProfile || mongoose.model<IUserProfile>("UserProfile", UserProfileSchema);