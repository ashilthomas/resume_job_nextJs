"use client";

import { useEffect, useState } from "react";
import SectionHeader from "@/components/SectionHeader";
import ResumeCard from "@/components/ResumeCard";
import JobMatchCard from "@/components/JobMatchCard";
import { findTopJobMatches } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resume, setResume] = useState<{
    name: string;
    email?: string;
    skills: string[];
    atsScore: number;
  } | null>(null);
  const [jobMatches, setJobMatches] = useState<Array<{
    title: string;
    company: string;
    score: number;
    missingSkills?: string[];
  }>>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Verify candidate role before fetching dashboard data
        const roleRes = await fetch('/api/user/role');
        if (!roleRes.ok) throw new Error('Failed to verify user role');
        const roleData = await roleRes.json();
        if (roleData.role !== 'candidate') {
          router.push('/');
          return;
        }
        
        // Fetch the most recent resume using candidate-protected API
        const resumeRes = await fetch('/api/candidate/resumes');
        if (!resumeRes.ok) throw new Error('Failed to fetch resume data');
        const resumeData = await resumeRes.json();
        
        if (!resumeData.resumes || resumeData.resumes.length === 0) {
          setError('No resumes found. Please upload a resume first.');
          setLoading(false);
          return;
        }
        
        const latestResume = resumeData.resumes[0];
        
        // Fetch jobs via candidate-protected API
        const jobsRes = await fetch('/api/candidate/jobs');
        if (!jobsRes.ok) throw new Error('Failed to fetch job data');
        const jobsData = await jobsRes.json();
        
        const topMatches = findTopJobMatches(latestResume.skills, jobsData.jobs || []);
        
        const name = latestResume.parsed?.name || 'Candidate';
        const email = latestResume.parsed?.emails?.[0] || '';
        
        setResume({
          name,
          email,
          skills: latestResume.skills || [],
          atsScore: latestResume.atsScore || 0,
        });
        
        setJobMatches(topMatches);
      } catch (err: unknown) {
        console.error('Dashboard data fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [router]);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
      <p className="font-medium">Error</p>
      <p>{error}</p>
      {error.includes('No resumes found') && (
        <a href="/upload" className="mt-4 inline-block px-4 py-2 bg-foreground text-white rounded-lg hover:bg-blue-700">
          Upload Resume
        </a>
      )}
    </div>
  );

  const firstName = resume?.name?.split(' ')[0] || 'there';

  return (
    <div className="space-y-8">
      <SectionHeader
        title={`Welcome back, ${firstName} 👋`}
        subtitle={resume?.email ? `${resume.email} • Here's your current resume insights, ATS performance, and top job matches.` : `Here's your current resume insights, ATS performance, and top job matches.`}
      />

      <ResumeCard {...resume} />

      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">🎯 Top Job Matches for {firstName}</h2>
        {jobMatches.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {jobMatches.map((job, idx: number) => (
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
            <p>No job matches found for {firstName}. Add more jobs to see potential matches.</p>
            <a href="/recruiter" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Add Jobs
            </a>
          </div>
        )}
      </section>
    </div>
  );
}
