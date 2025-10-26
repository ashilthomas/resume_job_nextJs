"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { useRouter } from "next/navigation";

type Job = {
  _id: string;
  title: string;
  company: string;
  location?: string;
  requiredSkills: string[];
  createdAt: string;
};

export default function JobsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true);
        
        // Verify recruiter role before accessing recruiter jobs
        const roleRes = await fetch('/api/user/role');
        if (!roleRes.ok) throw new Error('Failed to verify role');
        const roleData = await roleRes.json();
        if (roleData.role !== 'recruiter') {
          router.replace('/');
          return;
        }
        
        const response = await fetch('/api/recruiter/jobs');
        if (!response.ok) throw new Error('Failed to fetch jobs');
        const data = await response.json();
        setJobs(data.jobs || []);
      } catch (err: any) {
        console.error('Error fetching jobs:', err);
        setError(err.message || 'Failed to load jobs');
      } finally {
        setLoading(false);
      }
    }
    
    fetchJobs();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Available Jobs"
        subtitle="Browse through all available job opportunities"
      />
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div key={job._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{job.title}</h2>
                <p className="text-gray-600 mb-4">{job.company} • {job.location || 'Remote'}</p>
                
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Required Skills:</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.slice(0, 3).map((skill, index) => (
                      <span 
                        key={index} 
                        className="px-3 py-1 bg-blue-100 text-secondary rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.requiredSkills.length > 3 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                        +{job.requiredSkills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-sm text-gray-500 mb-4">
                  Posted on {new Date(job.createdAt).toLocaleDateString()}
                </div>
                
                <Link 
                  href={`/jobs/${job._id}`}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-secondary text-white rounded-lg hover:bg-blue-700 transition"
                >
                  View Details
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-center">
          <p className="mb-4">No jobs available at the moment.</p>
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