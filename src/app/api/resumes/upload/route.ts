import { NextRequest, NextResponse } from "next/server";
import multer from "multer";
import Resume from "@/lib/models/Resume";
import { connectDB } from "@/lib/db";
import { parseResumeFile } from "@/lib/parser";
import path from "path";
import fs from "fs";

const upload = multer({ dest: "uploads/" });
export const config = { api: { bodyParser: false } };

const 