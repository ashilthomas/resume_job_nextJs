"use client";

import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import { CheckCircle2 } from "lucide-react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export default function UploadPage() {
  const [result, setResult] = useState<{
    success: boolean;
    data?: {
      resumeId: string;
      fileName: string;
      atsScore: number;
    };
    error?: string;
  } | null>(null);

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-8">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900">Upload Your Resume</h1>
      <p className="text-gray-600 text-lg">
        Upload your resume to analyze skills, ATS score, and job match insights.
      </p>

      <SignedIn>
        <FileUpload onUpload={setResult} uploadUrl="/api/candidate/resumes/upload" />
      </SignedIn>

      <SignedOut>
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 space-y-4 text-center">
          <h2 className="text-xl font-semibold text-gray-900">Sign in to upload your resume</h2>
          <p className="text-gray-600">You need to be signed in to analyze and save resumes.</p>
          <SignInButton mode="modal">
            <button className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-white bg-foreground hover:bg-blue-700">
              Sign In
            </button>
          </SignInButton>
        </div>
      </SignedOut>

      {result && (
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-2 text-green-700 mb-3">
            <CheckCircle2 size={20} />
            <h2 className="text-xl font-semibold">Resume Analysis Complete</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-gray-700">
            <div>
              <p className="font-medium">Top Skills Detected</p>
              <ul className="list-disc pl-5 mt-2">
                {(result?.skills || []).slice(0, 6).map((skill: string, idx: number) => (
                  <li key={idx}>{skill}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium">ATS Score</p>
              <p className="text-2xl font-bold text-green-600">{result?.atsScore ?? 0}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
