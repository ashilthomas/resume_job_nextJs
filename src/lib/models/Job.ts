import mongoose, { Schema, Document } from "mongoose";

export interface IJob extends Document {
  title: string;
  company: string;
  description: string;
  requiredSkills: string[];
  location: string;
  userId: string;
  createdAt: Date;
}

const JobSchema = new Schema<IJob>({
  title: String,
  company: String,
  description: String,
  requiredSkills: [String],
  location: String,
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Job || mongoose.model<IJob>("Job", JobSchema);
