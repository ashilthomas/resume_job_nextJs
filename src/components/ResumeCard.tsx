import ATSScoreGauge from "./ATSScoreGauge";

interface ResumeCardProps {
  name: string;
  email?: string;
  skills: string[];
  atsScore: number;
}

export default function ResumeCard({ name, email, skills, atsScore }: ResumeCardProps) {
  return (
    <section className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">{name}</h2>
          <p className="text-gray-500">{email}</p>

          <div className="mt-3">
            <p className="text-sm font-medium text-gray-700">Skills</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 text-sm font-medium bg-blue-50 text-blue-700 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 md:mt-0">
          <ATSScoreGauge score={atsScore} />
        </div>
      </div>
    </section>
  );
}
