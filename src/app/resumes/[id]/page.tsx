"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Briefcase } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";

type Resume = {
  _id: string;
  fileName: string;
  filePath: string;
  parsed: {
    name: string;
    emails: string[];
    phones: string[];
    education: Array<{
      institution?: string;
      degree?: string;
      field?: string;
      year?: string;
    }>;
    workExperience: Array<{
      company?: string;
      position?: string;
      duration?: string;
      description?: string;
    }>;
    skills: string[];
    summary: string;
  };
  skills: string[];
  atsScore: number;
  createdAt: string;
};

export default function ResumeDetailsPage() {
  const params = useParams();
  const resumeId = params.id as string;
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resume, setResume] = useState<Resume | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchResume() {
      try {
        setLoading(true);
        
        // Verify candidate role before accessing resume details
        const roleRes = await fetch('/api/user/role');
        if (!roleRes.ok) throw new Error('Failed to verify user role');
        const roleData = await roleRes.json();
        if (roleData.role !== 'candidate') {
          router.push('/');
          return;
        }
        
        const response = await fetch(`/api/candidate/resumes/${resumeId}`);
        if (!response.ok) throw new Error('Failed to fetch resume details');
        
        const data = await response.json();
        setResume(data.resume);
      } catch (err: unknown) {
        console.error('Error fetching resume details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load resume details');
      } finally {
        setLoading(false);
      }
    }
    
    if (resumeId) {
      fetchResume();
    }
  }, [resumeId, router]);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
      {error}
    </div>
  );

  if (!resume) return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
      Resume not found
    </div>
  );

  async function handleDelete() {
    if (!resume?._id || deleting) return;
    const confirmDelete = window.confirm("Delete this resume? This cannot be undone.");
    if (!confirmDelete) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/candidate/resumes/${resume._id}`, { method: 'DELETE' });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || 'Failed to delete resume');
      }
      router.push('/resumes');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete resume');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        title={resume.parsed?.name || 'Unnamed Candidate'}
        subtitle={resume.parsed?.emails?.[0] || 'No email provided'}
        action={
          <Link 
            href={`/resumes/${resumeId}/matches`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            <Briefcase size={18} />
            Find Job Matches
          </Link>
        }
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {resume.parsed?.summary && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Summary</h2>
              <p className="text-gray-700">{resume.parsed.summary}</p>
            </div>
          )}
          
          {resume.parsed?.workExperience && resume.parsed.workExperience.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Work Experience</h2>
              <div className="space-y-6">
                {resume.parsed.workExperience.map((exp, index: number) => (
                  <div key={index} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                    <h3 className="font-semibold text-lg">{exp.position || 'Position'}</h3>
                    <p className="text-gray-700">{exp.company || 'Company'}</p>
                    {exp.duration && <p className="text-gray-500 text-sm">{exp.duration}</p>}
                    {exp.description && <p className="mt-2 text-gray-600">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {resume.parsed?.education && resume.parsed.education.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Education</h2>
              <div className="space-y-4">
                {resume.parsed.education.map((edu, index: number) => (
                  <div key={index} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                    <h3 className="font-semibold">{edu.degree || 'Degree'}</h3>
                    <p className="text-gray-700">{edu.institution || 'Institution'}</p>
                    {edu.year && <p className="text-gray-500 text-sm">{edu.year}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">ATS Score</h2>
            <div className="flex items-center justify-center">
              <div className="w-32 h-32 rounded-full flex items-center justify-center bg-blue-50 border-4 border-blue-500">
                <span className="text-4xl font-bold text-blue-700">{resume.atsScore}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Skills</h2>
            
            <div className="flex flex-wrap gap-2">
              {resume.skills.map((skill, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          
          {resume.parsed?.phones && resume.parsed.phones.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              
              <div className="space-y-2">
                {resume.parsed.emails && resume.parsed.emails.map((email, index) => (
                  <p key={`email-${index}`} className="text-gray-700">
                    <span className="font-medium">Email:</span> {email}
                  </p>
                ))}
                
                {resume.parsed.phones && resume.parsed.phones.map((phone, index) => (
                  <p key={`phone-${index}`} className="text-gray-700">
                    <span className="font-medium">Phone:</span> {phone}
                  </p>
                ))}
              </div>
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            
            <div className="space-y-3">
              <Link 
                href={`/resumes/${resumeId}/matches`}
                className="flex items-center justify-between w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
              >
                <span className="font-medium">Find Job Matches</span>
                <ArrowRight size={18} />
              </Link>
              
              <Link 
                href="/resumes"
                className="flex items-center justify-between w-full px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition"
              >
                <span className="font-medium">Back to All Resumes</span>
                <ArrowRight size={18} />
              </Link>

              <button
                onClick={handleDelete}
                disabled={deleting}
                className={`w-full px-4 py-2 rounded-lg transition ${deleting ? 'bg-red-200 text-red-500' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}
              >
                {deleting ? 'Deleting…' : 'Delete Resume'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}