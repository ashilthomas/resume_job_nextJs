"use client";

import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);

  const handleUpload = async () => {
    if (!file) return alert("Choose a file first!");
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/resumes/upload", { method: "POST", body: form });
    const data = await res.json();
    setResult(data.resume);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Upload Resume</h1>
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button
        onClick={handleUpload}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        Upload
      </button>

      {result && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-50">
          <h2 className="font-semibold">Parsed Resume</h2>
          <p><b>Skills:</b> {result.skills?.join(", ")}</p>
          <p><b>ATS Score:</b> {result.atsScore}</p>
          <pre className="text-sm mt-2 whitespace-pre-wrap">{result.parsed.summary}</pre>
        </div>
      )}
    </div>
  );
}
