import mongoose, { Schema, Document } from "mongoose";

export interface IResume extends Document {
  fileName: string;
  filePath: string | null;
  parsed: any;
  skills: string[];
  userId: string;
  atsScore: number;
  createdAt: Date;
}

const ResumeSchema = new Schema<IResume>({
  fileName: { type: String, required: true },
  filePath: { type: String, default: null },
  parsed: { type: Schema.Types.Mixed, required: true },
  skills: { type: [String], default: [] },
  atsScore: { type: Number, required: true },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Resume ||
  mongoose.model<IResume>("Resume", ResumeSchema);