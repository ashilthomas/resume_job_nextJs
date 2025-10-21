
import Link from "next/link";

export default function HomePage() {
  return (
    <section className="flex flex-col items-center justify-center text-center py-20">
      <h1 className="text-4xl md:text-5xl text-foreground font-extrabold mb-6">
        <span className="">
       AI Resume</span> & Job Match Portal
      </h1>

      <p className="text-lg text-gray-600 max-w-2xl mb-8 ">
        Upload your resume and let AI analyze your skills, match you with top jobs,
        and suggest improvements to boost your ATS score.
      </p>

      <Link 
        href="/upload"
        className="px-6 py-3 bg-secondary text-background  font-semibold rounded-xl shadow  transition"
      >
        Get Started – Upload Resume
      </Link>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-4xl">
        <FeatureCard
          title="AI Resume Parsing"
          desc="Upload your resume (PDF/DOCX) and instantly get extracted skills, experience, and summary."
        />
        <FeatureCard
          title="Job Match Recommendations"
          desc="Our AI compares your skills with real job listings and finds the best matches."
        />
        <FeatureCard
          title="ATS Score & Suggestions"
          desc="Get insights on how to improve your resume to pass Applicant Tracking Systems."
        />
      </div>
    </section>
  );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition">
      <h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-gray-600">{desc}</p>
    </div>
  );
}
