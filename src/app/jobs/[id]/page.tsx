"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";

type Job = {
  _id: string;
  title: string;
  company: string;
  description: string;
  location?: string;
  requiredSkills: string[];
  createdAt: string;
};

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);

  useEffect(() => {
    async function fetchJob() {
      try {
        setLoading(true);
        
        const response = await fetch(`/api/jobs/${jobId}`);
        if (!response.ok) throw new Error('Failed to fetch job details');
        
        const data = await response.json();
        setJob(data.job);
      } catch (err: any) {
        console.error('Error fetching job details:', err);
        setError(err.message || 'Failed to load job details');
      } finally {
        setLoading(false);
      }
    }
    
    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  const handleFindCandidates = () => {
    router.push(`/jobs/${jobId}/candidates`);
  };

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

  if (!job) return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
      Job not found
    </div>
  );

  return (
    <div className="space-y-8">
      <SectionHeader
        title={job.title}
        subtitle={`${job.company} - ${job.location || 'Remote'}`}
        action={
          <button 
            onClick={handleFindCandidates}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            <Users size={18} />
            View Candidates
          </button>
        }
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Job Description</h2>
            <div className="prose max-w-none">
              {job.description.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Job Details</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Company</h3>
                <p className="mt-1">{job.company}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Location</h3>
                <p className="mt-1">{job.location || 'Remote'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Posted On</h3>
                <p className="mt-1">{new Date(job.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Required Skills</h2>
            
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.map((skill, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            
            <div className="space-y-3">
              <Link 
                href={`/jobs/${jobId}/candidates`}
                className="flex items-center justify-between w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
              >
                <span className="font-medium">View Candidates</span>
                <ArrowRight size={18} />
              </Link>
              
              <Link 
                href="/recruiter"
                className="flex items-center justify-between w-full px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition"
              >
                <span className="font-medium">Back to Dashboard</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}