"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import SectionHeader from "@/components/SectionHeader";
import JobMatchCard from "@/components/JobMatchCard";
import { useRouter } from "next/navigation";

export default function ResumeMatchesPage() {
  const params = useParams();
  const resumeId = params.id as string;
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resume, setResume] = useState<any>(null);
  const [jobMatches, setJobMatches] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Verify candidate role before fetching matches
        const roleRes = await fetch('/api/user/role');
        if (!roleRes.ok) throw new Error('Failed to verify user role');
        const roleData = await roleRes.json();
        if (roleData.role !== 'candidate') {
          router.push('/');
          return;
        }
        
        // Fetch the resume details
        const resumeRes = await fetch(`/api/candidate/resumes/${resumeId}`);
        if (!resumeRes.ok) throw new Error('Failed to fetch resume data');
        const resumeData = await resumeRes.json();
        
        // Fetch job matches for this resume
        const matchesRes = await fetch(`/api/candidate/resumes/${resumeId}/matches`);
        if (!matchesRes.ok) throw new Error('Failed to fetch job matches');
        const matchesData = await matchesRes.json();
        
        setResume(resumeData.resume);
        setJobMatches(matchesData.jobMatches || []);
      } catch (err: any) {
        console.error('Job matches fetch error:', err);
        setError(err.message || 'Failed to load job matches');
      } finally {
        setLoading(false);
      }
    }
    
    if (resumeId) {
      fetchData();
    }
  }, [resumeId, router]);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
      <p className="font-medium">Error</p>
      <p>{error}</p>
    </div>
  );

  const candidateName = resume?.parsed?.name || 'Candidate';

  return (
    <div className="space-y-8">
      <SectionHeader
        title={`Job Matches for ${candidateName}`}
        subtitle="Here are the top job matches based on your skills and experience."
      />

      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">🎯 Top Job Matches</h2>
        {jobMatches.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {jobMatches.map((job: any, idx: number) => (
              <JobMatchCard 
                key={idx} 
                title={job.title} 
                company={job.company} 
                score={job.score} 
                missingSkills={job.missingSkills} 
              />
            ))}
          </div>
        ) : (
          <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
            <p>No job matches found. Add more jobs to see potential matches.</p>
            <a href="/recruiter" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Add Jobs
            </a>
          </div>
        )}
      </section>
    </div>
  );
}