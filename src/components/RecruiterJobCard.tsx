"use client";

import { useState } from "react";
import { Briefcase, MapPin, Calendar, Tag } from "lucide-react";
import Link from "next/link";

interface RecruiterJobCardProps {
  id: string;
  title: string;
  company: string;
  location?: string;
  skills?: string[];
  createdAt?: string | Date;
  onDeleted?: (id: string) => void;
}

export default function RecruiterJobCard({ id, title, company, location, skills = [], createdAt, onDeleted }: RecruiterJobCardProps) {
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  // Format date if available
  const formattedDate = createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A';
  
  return (
    <div className="p-6 bg-background rounded-2xl border border-light shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Briefcase className="text-primary" size={20} />
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        </div>
        <button
          className="text-sm px-3 py-1.5 rounded-lg border border-light text-foreground hover:bg-foreground/5 disabled:opacity-60"
          onClick={async () => {
            if (!confirm("Delete this job? This action cannot be undone.")) return;
            setDeleteError(null);
            setDeleting(true);
            try {
              const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || 'Failed to delete job');
              onDeleted?.(id);
            } catch (err: any) {
              setDeleteError(err.message || 'Failed to delete job');
            } finally {
              setDeleting(false);
            }
          }}
          disabled={deleting}
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
      <div className="space-y-3 mb-4">
        <p className="text-gray-600 font-medium">{company}</p>
        
        {location && (
          <div className="flex items-center gap-2 text-gray-500">
            <MapPin size={16} />
            <span>{location}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-gray-500">
          <Calendar size={16} />
          <span>Posted: {formattedDate}</span>
        </div>
        
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {skills.map((skill, idx) => (
              <span 
                key={idx}
                className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full flex items-center gap-1"
              >
                <Tag size={12} />
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
        <Link
          href={`/api/jobs/${id}/candidates`}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          View Candidates
        </Link>
        
        <Link
          href={`/resumes/matches?jobId=${id}`}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Find Matches →
        </Link>
      </div>
      {deleteError && (
        <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
          {deleteError}
        </div>
      )}
    </div>
  );
}
