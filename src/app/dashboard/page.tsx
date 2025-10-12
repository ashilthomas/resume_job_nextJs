"use client";

import { useEffect, useState } from "react";
import SectionHeader from "@/components/SectionHeader";
import ResumeCard from "@/components/ResumeCard";
import JobMatchCard from "@/components/JobMatchCard";

export default function DashboardPage() {
  const [candidate, setCandidate] = useState<any>(null);

  useEffect(() => {
    setCandidate({
      name: "Jane Doe",
      email: "jane.doe@example.com",
      skills: ["Python", "Machine Learning", "AWS", "TensorFlow"],
      atsScore: 88,
      jobMatches: [
        { title: "Data Scientist", company: "Google", score: 92, missingSkills: ["Big Data", "Spark"] },
        { title: "AI Engineer", company: "Amazon", score: 84, missingSkills: ["Kubernetes"] },
      ],
    });
  }, []);

  if (!candidate) return <p>Loading...</p>;

  return (
    <div className="space-y-8">
      <SectionHeader
        title={`Welcome back, ${candidate.name.split(" ")[0]} 👋`}
        subtitle="Here’s your current resume insights, ATS performance, and top job matches."
      />

      <ResumeCard {...candidate} />

      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">🎯 Top Job Matches</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {candidate.jobMatches.map((job: any, idx: number) => (
            <JobMatchCard key={idx} {...job} />
          ))}
        </div>
      </section>
    </div>
  );
}
