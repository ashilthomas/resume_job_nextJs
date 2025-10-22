"use client";

import { useEffect, useState } from "react";
import SectionHeader from "@/components/SectionHeader";
import ResumeCard from "@/components/ResumeCard";
import JobMatchCard from "@/components/JobMatchCard";
import { findTopJobMatches } from "@/lib/utils";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resume, setResume] = useState<any>(null);
  const [jobMatches, setJobMatches] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch the most recent resume
        const resumeRes = await fetch('/api/resumes');
        if (!resumeRes.ok) throw new Error('Failed to fetch resume data');
        const resumeData = await resumeRes.json();
        
        if (!resumeData.resumes || resumeData.resumes.length === 0) {
          setError('No resumes found. Please upload a resume first.');
          setLoading(false);
          return;
        }
        
        // Get the most recent resume
        const latestResume = resumeData.resumes[0];
        
        // Fetch all jobs
        const jobsRes = await fetch('/api/jobs');
        if (!jobsRes.ok) throw new Error('Failed to fetch job data');
        const jobsData = await jobsRes.json();
        
        // Calculate top job matches
        const topMatches = findTopJobMatches(latestResume.skills, jobsData.jobs || []);
        
        // Extract name and email from parsed resume data
        const name = latestResume.parsed?.name || 'Candidate';
        const email = latestResume.parsed?.emails?.[0] || '';
        
        setResume({
          name,
          email,
          skills: latestResume.skills || [],
          atsScore: latestResume.atsScore || 0,
        });
        
        setJobMatches(topMatches);
      } catch (err: any) {
        console.error('Dashboard data fetch error:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

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
