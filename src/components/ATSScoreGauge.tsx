interface ATSScoreGaugeProps {
  score: number;
}

export default function ATSScoreGauge({ score }: ATSScoreGaugeProps) {
  return (
    <div className="text-center">
      <p className="text-sm uppercase tracking-wide text-gray-500 mb-2">ATS Score</p>
      <div className="relative w-32 h-32 flex items-center justify-center mx-auto">
        <svg className="absolute w-full h-full -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="#e5e7eb"
            strokeWidth="10"
            fill="none"
          />
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="#14B45A"
            strokeWidth="10"
            fill="none"
            strokeDasharray="351.86"
            strokeDashoffset={(351.86 * (100 - score)) / 100}
            strokeLinecap="round"
          />
        </svg>
        <span className="text-3xl font-bold text-secondary ">{score}%</span>
      </div>
      <p className="text-sm text-gray-500 mt-1">Optimization readiness</p>
    </div>
  );
}
