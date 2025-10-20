"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SectionHeader from "@/components/SectionHeader";
import { Building2, Briefcase, MapPin, Tag, FileText, Loader2, X } from "lucide-react";

export default function AddJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Enhanced UI state for skills tags
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    description: "",
    location: "",
    requiredSkills: ""
  });

  const addSkill = (value: string) => {
    const skill = value.trim();
    if (!skill) return;
    if (!skills.includes(skill)) {
      setSkills(prev => [...prev, skill]);
    }
    setSkillInput("");
    setFormData(prev => ({ ...prev, requiredSkills: "" }));
  };

  const removeSkill = (skill: string) => {
    setSkills(prev => prev.filter(s => s !== skill));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(skillInput);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "requiredSkills") {
      setSkillInput(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Prefer tags, fallback to CSV
      const requiredSkills = skills.length > 0
        ? skills
        : formData.requiredSkills
            .split(",")
            .map(skill => skill.trim())
            .filter(skill => skill !== "");
      
      const response = await fetch("/api/jobs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          requiredSkills
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to create job");
      }
      
      setSuccess(true);
      setFormData({
        title: "",
        company: "",
        description: "",
        location: "",
        requiredSkills: ""
      });
      setSkills([]);
      setSkillInput("");
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push("/recruiter");
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <SectionHeader
        title="Add New Job"
        subtitle="Create a new job posting with required skills for matching with candidates."
      />
      <p className="text-sm text-muted">Fields marked with <span className="text-destructive">*</span> are required.</p>
      
      {success && (
        <div className="p-4 bg-secondary/10 border border-secondary/20 rounded-lg text-secondary">
          Job created successfully! Redirecting...
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8 bg-background p-8 rounded-2xl shadow-sm border border-light">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                Job Title *
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 px-4 py-3 border border-light rounded-lg focus:ring-primary focus:border-primary"
                  placeholder="Senior Frontend Engineer"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-foreground mb-2">
                Company *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 px-4 py-3 border border-light rounded-lg focus:ring-primary focus:border-primary"
                  placeholder="Acme Corp"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-foreground mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full pl-10 px-4 py-3 border border-light rounded-lg focus:ring-primary focus:border-primary"
                  placeholder="Remote / New York, USA"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="requiredSkills" className="block text-sm font-medium text-foreground mb-2">
                Required Skills (press Enter or comma to add)
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input
                  type="text"
                  id="requiredSkills"
                  name="requiredSkills"
                  value={skillInput}
                  onChange={handleChange}
                  onKeyDown={handleSkillKeyDown}
                  placeholder="React, TypeScript, Node.js"
                  className="w-full pl-10 px-4 py-3 border border-light rounded-lg focus:ring-primary focus:border-primary"
                />
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full flex items-center gap-1"
                    >
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="ml-1 text-muted hover:text-foreground">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                Job Description *
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-muted" size={18} />
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={6}
                  maxLength={1000}
                  className="w-full pl-10 px-4 py-3 border border-light rounded-lg focus:ring-primary focus:border-primary"
                  placeholder="Describe the role, responsibilities, and requirements..."
                />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-muted">Provide a clear and concise description to attract qualified candidates.</p>
                <span className="text-xs text-muted">{formData.description.length}/1000</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 lg:sticky lg:top-6">
            <div className="p-6 bg-background rounded-2xl border border-light shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-4">Live Preview</h3>
              <div className="p-4 bg-background rounded-xl border border-light">
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="text-primary" size={18} />
                  <h4 className="text-xl font-semibold text-foreground">{formData.title || "Job Title"}</h4>
                </div>
                <p className="text-muted font-medium">{formData.company || "Company"}</p>
                {formData.location && (
                  <div className="flex items-center gap-2 text-muted mt-2">
                    <MapPin size={16} />
                    <span>{formData.location}</span>
                  </div>
                )}
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {skills.map((skill) => (
                      <span key={skill} className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-primary text-white py-3 px-4 rounded-lg hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (<><Loader2 className="animate-spin" size={18} /> Creating...</>) : (<>Post Job</>)}
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({ title: "", company: "", description: "", location: "", requiredSkills: "" });
                setSkills([]);
                setSkillInput("");
              }}
              className="w-full sm:w-auto bg-background text-foreground border border-light py-3 px-4 rounded-lg hover:bg-foreground/5"
            >
              Reset
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}