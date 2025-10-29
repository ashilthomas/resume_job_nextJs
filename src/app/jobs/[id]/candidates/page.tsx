"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SectionHeader from "@/components/SectionHeader";

type Candidate = {
  resumeId: string;
  name: string;
  email: string;
  skills: string[];
  atsScore: number;
  matchScore: number;
  missingSkills: string[];
};

type Job = {
  _id: string;
  title: string;
  company: string;
  location?: string;
  requiredSkills: string[];
};

export default function JobCandidatesPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  useEffect(() => {
    async function fetchCandidates() {
      try {
        setLoading(true);
        
        // Verify recruiter role before accessing candidates
        const roleRes = await fetch('/api/user/role');
        if (!roleRes.ok) throw new Error('Failed to verify user role');
        const roleData = await roleRes.json();
        if (roleData.role !== 'recruiter') {
          router.push('/');
          return;
        }

        const response = await fetch(`/api/recruiter/jobs/${jobId}/candidates`);
        if (!response.ok) throw new Error('Failed to fetch candidates');
        
        const data = await response.json();
        setJob(data.job);
        setCandidates(data.candidates || []);
      } catch (err: unknown) {
        console.error('Error fetching candidates:', err);
        setError(err instanceof Error ? err.message : 'Failed to load candidates');
      } finally {
        setLoading(false);
      }
    }
    
    if (jobId) {
      fetchCandidates();
    }
  }, [jobId, router]);

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
        title={`Candidates for ${job.title}`}
        subtitle={`${job.company} - ${job.location || 'Remote'}`}
      />
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-2">Job Details</h2>
        <p className="text-gray-600 mb-4">{job.title} at {job.company}</p>
        
        <h3 className="font-medium mb-2">Required Skills:</h3>
        <div className="flex flex-wrap gap-2 mb-6">
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

      <div>
        <h2 className="text-2xl font-semibold mb-4">Matching Candidates ({candidates.length})</h2>
        
        {candidates.length > 0 ? (
          <div className="space-y-4">
            {candidates.map((candidate) => (
              <div key={candidate.resumeId} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{candidate.name}</h3>
                    <p className="text-gray-600">{candidate.email}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <span className="block text-2xl font-bold text-blue-600">{candidate.matchScore}%</span>
                      <span className="text-sm text-gray-500">Match</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-2xl font-bold text-green-600">{candidate.atsScore}</span>
                      <span className="text-sm text-gray-500">ATS</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Skills:</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {candidate.skills.map((skill, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  {candidate.missingSkills.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Missing Skills:</h4>
                      <div className="flex flex-wrap gap-2">
                        {candidate.missingSkills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
            <p>No matching candidates found.</p>
          </div>
        )}
      </div>
    </div>
  );
}