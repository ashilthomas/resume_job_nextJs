/**
 * Calculate job match score based on candidate skills and job required skills
 */
export function calculateJobMatch(candidateSkills: string[], jobRequiredSkills: string[]) {
  if (!jobRequiredSkills.length) return { score: 100, missingSkills: [] };
  
  // Convert to lowercase for case-insensitive comparison
  const normalizedCandidateSkills = candidateSkills.map(skill => skill.toLowerCase());
  
  // Find missing skills
  const missingSkills = jobRequiredSkills.filter(
    skill => !normalizedCandidateSkills.includes(skill.toLowerCase())
  );
  
  // Calculate match percentage
  const matchedSkills = jobRequiredSkills.length - missingSkills.length;
  const score = Math.round((matchedSkills / jobRequiredSkills.length) * 100);
  
  return { score, missingSkills };
}

/**
 * Find top matching jobs for a candidate based on skills
 */
export function findTopJobMatches(candidateSkills: string[], jobs: Record<string, unknown>[], limit = 5) {
  if (!jobs.length) return [];
  
  const jobsWithScores = jobs.map(job => {
    const { score, missingSkills } = calculateJobMatch(candidateSkills, job.requiredSkills);
    return {
      ...job,
      score,
      missingSkills
    };
  });
  
  // Sort by score (highest first) and take the top matches
  return jobsWithScores
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}