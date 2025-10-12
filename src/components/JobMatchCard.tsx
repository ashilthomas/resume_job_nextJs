import { AlertTriangle, CheckCircle } from "lucide-react";

interface JobMatchProps {
  title: string;
  company: string;
  score: number;
  missingSkills?: string[];
}

export default function JobMatchCard({ title, company, score, missingSkills }: JobMatchProps) {
  const perfect = !missingSkills || missingSkills.length === 0;

  return (
    <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-blue-700">{title}</h3>
          <p className="text-gray-500">{company}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-gray-800">{score}%</p>
          <p className="text-xs text-gray-500">Match Score</p>
        </div>
      </div>

      {perfect ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <p>Perfect match for this role!</p>
        </div>
      ) : (
        <div className="mt-4 flex items-start gap-2 text-sm text-yellow-700 bg-yellow-50 p-3 rounded-lg">
          <AlertTriangle className="w-4 h-4 mt-0.5 text-yellow-600" />
          <p>
            Missing skills:{" "}
            <span className="font-medium">{missingSkills.join(", ")}</span>
          </p>
        </div>
      )}
    </div>
  );
}
