"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { useRouter } from "next/navigation";

type Resume = {
  _id: string;
  fileName: string;
  parsed: {
    name: string;
    emails: string[];
  };
  skills: string[];
  atsScore: number;
  createdAt: string;
};

export default function ResumesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchResumes() {
      try {
        setLoading(true);
        
        // Verify candidate role before accessing resumes
        const roleRes = await fetch('/api/user/role');
        if (!roleRes.ok) throw new Error('Failed to verify user role');
        const roleData = await roleRes.json();
        if (roleData.role !== 'candidate') {
          router.push('/');
          return;
        }
        
        const response = await fetch('/api/candidate/resumes');
        if (!response.ok) throw new Error('Failed to fetch resumes');
        
        const data = await response.json();
        setResumes(data.resumes || []);
      } catch (err: any) {
        console.error('Error fetching resumes:', err);
        setError(err.message || 'Failed to load resumes');
      } finally {
        setLoading(false);
      }
    }
    
    fetchResumes();
  }, [router]);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      <SectionHeader
        title="All Resumes"
        subtitle="Browse through all uploaded resumes"
      />
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {resumes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <div key={resume._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{resume.parsed?.name || 'Unnamed Candidate'}</h2>
                <p className="text-gray-600 mb-4">{resume.parsed?.emails?.[0] || 'No email provided'}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="text-center">
                    <span className="block text-2xl font-bold text-green-600">{resume.atsScore}</span>
                    <span className="text-sm text-gray-500">ATS Score</span>
                  </div>
                  
                  <div className="text-center">
                    <span className="block text-2xl font-bold text-blue-600">{resume.skills.length}</span>
                    <span className="text-sm text-gray-500">Skills</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Skills:</h3>
                  <div className="flex flex-wrap gap-2">
                    {resume.skills.slice(0, 3).map((skill, index) => (
                      <span 
                        key={index} 
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                    {resume.skills.length > 3 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                        +{resume.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-sm text-gray-500 mb-4">
                  Uploaded on {new Date(resume.createdAt).toLocaleDateString()}
                </div>
                
                <div className="flex flex-col gap-2">
                  <Link 
                    href={`/resumes/${resume._id}`}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    View Details
                    <ArrowRight size={16} />
                  </Link>
                  
                  <Link 
                    href={`/resumes/${resume._id}/matches`}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Find Job Matches
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-center">
          <p className="mb-4">No resumes uploaded yet.</p>
          <Link 
            href="/dashboard"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      )}
    </div>
  );
}