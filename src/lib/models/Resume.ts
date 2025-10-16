import mongoose, { Schema, Document } from "mongoose";
export interface IResume extends Document{
    filename:String;
    filepath:string;
      parsed: any;
       skills: string[];

     atsScore: number;,
       createdAt: Date;
}
const ResumeSchema = new Schema<IResume>({
     fileName: String,
  filePath: String,
  parsed: Object,
  skills: [String],
  atsScore: Number,
  createdAt: { type: Date, default: Date.now },
})
export default mongoose.models.Resume ||
  mongoose.model<IResume>("Resume", ResumeSchema);