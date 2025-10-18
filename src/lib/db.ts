import mongoose from "mongoose";
const MONGO_URI = process.env.MONGO_URI ||  "mongodb+srv://ashilthomas31_db_user:ITleQWSBHpONrLEO@cluster0.vgd4lls.mongodb.net/AiResume_Job";


if (!MONGO_URI) {
  throw new Error("Please define the MONGO_URI in .env.local");
}
let cached = (global as any).mongoose || { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, { bufferCommands: false })
      .then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}