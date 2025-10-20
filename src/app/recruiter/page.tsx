"use client";

import { useEffect, useState } from "react";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import SectionHeader from "@/components/SectionHeader";
import RecruiterJobCard from "@/components/RecruiterJobCard";

export default function RecruiterDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true);
        
        const response = await fetch('/api/jobs');
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
        title="Recruiter Dashboard"
        subtitle="Manage your job postings and track candidate applications."
        action={
          <Link href="/recruiter/add-job" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
            <PlusCircle size={18} />
            Post New Job
          </Link>
        }
      />
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <section>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Active Job Listings</h2>
        
        {jobs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <RecruiterJobCard 
                key={job._id} 
                id={job._id}
                title={job.title}
                company={job.company}
                location={job.location || 'Remote'}
                skills={job.requiredSkills || []}
                createdAt={job.createdAt}
              />
            ))}
          </div>
        ) : (
          <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-center">
            <p className="mb-4">No jobs posted yet.</p>
            <Link 
              href="/recruiter/add-job"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Job
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
