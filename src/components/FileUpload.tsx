"use client";
import { useState } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";

interface FileUploadProps {
  onUpload: (result: any) => void;
}

export default function FileUpload({ onUpload }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Please choose a file first!");
    setLoading(true);

    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/resumes/upload", { method: "POST", body: form });
      const data = await res.json();
      onUpload(data.resume);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 text-center hover:shadow-md transition">
      <label
        htmlFor="resumeUpload"
        className="cursor-pointer flex flex-col items-center justify-center space-y-3"
      >
        <Upload className="text-blue-600 w-10 h-10" />
        <p className="text-gray-700 font-medium">
          {file ? file.name : "Drag & Drop or Click to Upload"}
        </p>
        <p className="text-sm text-gray-500">
          Accepted formats: PDF, DOCX • Max 5MB
        </p>
        <input
          id="resumeUpload"
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </label>

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className={`mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-white transition ${
          loading
            ? "bg-blue-300 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin w-4 h-4" /> Uploading...
          </>
        ) : (
          <>
            <FileText size={18} /> Analyze Resume
          </>
        )}
      </button>
    </div>
  );
}
