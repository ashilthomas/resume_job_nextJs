import { Briefcase, Users } from "lucide-react";

interface RecruiterJobCardProps {
  id: number;
  title: string;
  company: string;
  candidates: number;
}

export default function RecruiterJobCard({ id, title, company, candidates }: RecruiterJobCardProps) {
  return (
    <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Briefcase className="text-blue-600" size={20} />
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        </div>
        <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
          ID #{id}
        </span>
      </div>

      <p className="text-gray-600 mb-4">{company}</p>

      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Users size={18} />
          <span className="font-medium">
            {candidates} <span className="text-sm text-gray-500">Candidates</span>
          </span>
        </div>

        <a
          href={`/recruiter/jobs/${id}`}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          View Candidates →
        </a>
      </div>
    </div>
  );
}
