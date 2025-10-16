"use client";

import { PlusCircle } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import RecruiterJobCard from "@/components/RecruiterJobCard";

export default function RecruiterDashboard() {
  const jobs = [
    { id: 1, title: "Data Scientist", company: "Google", candidates: 5 },
    { id: 2, title: "Fullstack Developer", company: "Amazon", candidates: 3 },
    { id: 3, title: "DevOps Engineer", company: "Microsoft", candidates: 4 },
  ];

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Recruiter Dashboard"
        subtitle="Manage your job postings and track candidate applications."
        action={
          <button className="flex items-center gap-2 px-4 py-2 bg-background text-white rounded-lg font-medium hover:bg-blue-700 transition">
            <PlusCircle size={18} />
            Post New Job
          </button>
        }
      />

      <section>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Active Job Listings</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <RecruiterJobCard key={job.id} {...job} />
          ))}
        </div>
      </section>
    </div>
  );
}
