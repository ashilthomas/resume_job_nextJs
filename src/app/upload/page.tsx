"use client";

import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import { CheckCircle2 } from "lucide-react";

export default function UploadPage() {
  const [result, setResult] = useState<any>(null);

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-8">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900">Upload Your Resume</h1>
      <p className="text-gray-600 text-lg">
        Upload your resume to analyze skills, ATS score, and job match insights.
      </p>

      <FileUpload onUpload={setResult} />

      {result && (
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-2 text-green-700 mb-3">
            <CheckCircle2 size={20} />
            <h2 className="text-xl font-semibold">Resume Analysis Complete</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-gray-700">
            <div>
              <p className="font-medium text-gray-900 mb-1">Key Skills</p>
              <div className="flex flex-wrap gap-2">
                {result.skills?.map((skill: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="font-medium text-gray-900 mb-1">ATS Score</p>
              <div className="relative w-full bg-gray-200 h-3 rounded-full">
                <div
                  className="absolute top-0 left-0 h-3 bg-green-600 rounded-full"
                  style={{ width: `${result.atsScore || 0}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {result.atsScore ? `${result.atsScore}% match` : "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
