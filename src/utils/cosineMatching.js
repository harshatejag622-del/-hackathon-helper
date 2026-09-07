/**
 * Cosine Similarity & Role Complementarity Engine for HackathonHelper
 */

// Helper to compute cosine similarity between two tag/string sets
export function calculateCosineSimilarity(setA = [], setB = []) {
  if (!setA.length || !setB.length) return 0;

  // Build unique vocabulary
  const normalizedA = setA.map(s => s.toLowerCase().trim());
  const normalizedB = setB.map(s => s.toLowerCase().trim());
  
  const vocab = Array.from(new Set([...normalizedA, ...normalizedB]));
  if (vocab.length === 0) return 0;

  // Vector representation (binary frequency)
  const vecA = vocab.map(term => (normalizedA.includes(term) ? 1 : 0));
  const vecB = vocab.map(term => (normalizedB.includes(term) ? 1 : 0));

  // Dot product
  let dotProduct = 0;
  for (let i = 0; i < vocab.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }

  // Magnitudes
  const magA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));

  if (magA === 0 || magB === 0) return 0;

  return dotProduct / (magA * magB);
}

// Role Complementarity Synergy Matrix (0.0 to 1.0)
// Higher values signify high mutual synergy in a 48h hackathon squad
const ROLE_SYNERGY_MATRIX = {
  Frontend: {
    Backend: 1.0,
    FullStack: 0.95,
    ML: 0.9,
    Design: 0.95,
    DevOps: 0.8,
    Frontend: 0.35, // 2 frontends have diminishing returns
  },
  Backend: {
    Frontend: 1.0,
    Design: 0.9,
    ML: 0.95,
    DevOps: 0.9,
    FullStack: 0.85,
    Backend: 0.4,
  },
  ML: {
    FullStack: 1.0,
    Frontend: 0.95,
    Backend: 0.95,
    Design: 0.85,
    DevOps: 0.9,
    ML: 0.4,
  },
  Design: {
    Frontend: 1.0,
    FullStack: 0.95,
    Backend: 0.9,
    ML: 0.85,
    DevOps: 0.75,
    Design: 0.3,
  },
  DevOps: {
    Backend: 0.95,
    FullStack: 0.95,
    ML: 0.9,
    Frontend: 0.8,
    Design: 0.75,
    DevOps: 0.3,
  },
  FullStack: {
    ML: 1.0,
    Design: 0.95,
    Backend: 0.85,
    Frontend: 0.85,
    DevOps: 0.9,
    FullStack: 0.8,
  }
};

export function calculateRoleSynergy(roleA = 'FullStack', roleB = 'FullStack') {
  const normA = roleA || 'FullStack';
  const normB = roleB || 'FullStack';

  if (ROLE_SYNERGY_MATRIX[normA] && ROLE_SYNERGY_MATRIX[normA][normB] !== undefined) {
    return ROLE_SYNERGY_MATRIX[normA][normB];
  }
  return 0.75; // Default neutral synergy
}

/**
 * Match evaluation using the user specified weighting:
 * - Skills: 40%
 * - Interests: 30%
 * - Role Complementarity: 30%
 */
export function calculateCandidateMatch(userProfile, candidateProfile) {
  const userSkills = userProfile?.skills || [];
  const candidateSkills = candidateProfile?.skills || [];

  const userInterests = userProfile?.interests || [];
  const candidateInterests = candidateProfile?.interests || [];

  const userRole = userProfile?.preferredRole || 'FullStack';
  const candidateRole = candidateProfile?.preferredRole || 'FullStack';

  // 1. Skills Cosine Similarity (40%)
  const skillsSimilarity = calculateCosineSimilarity(userSkills, candidateSkills);

  // 2. Interests Cosine Similarity (30%)
  const interestsSimilarity = calculateCosineSimilarity(userInterests, candidateInterests);

  // 3. Role Complementarity (30%)
  const roleSynergy = calculateRoleSynergy(userRole, candidateRole);

  // Weighted aggregate formula
  const weightedScore = (
    skillsSimilarity * 0.40 +
    interestsSimilarity * 0.30 +
    roleSynergy * 0.30
  );

  // Scale score to a natural hackathon match range (70% to 99%)
  // Even partial overlap produces a meaningful collaborative match
  const percentage = Math.min(99, Math.max(62, Math.round(weightedScore * 100)));

  // Identify common skills and complementary (missing) skills
  const normalizedUserSkills = userSkills.map(s => s.toLowerCase());
  const commonSkills = candidateSkills.filter(skill => 
    normalizedUserSkills.includes(skill.toLowerCase())
  );
  const complementarySkills = candidateSkills.filter(skill => 
    !normalizedUserSkills.includes(skill.toLowerCase())
  );

  const normalizedUserInterests = userInterests.map(i => i.toLowerCase());
  const commonInterests = candidateInterests.filter(interest =>
    normalizedUserInterests.includes(interest.toLowerCase())
  );

  return {
    percentage,
    breakdown: {
      skillsScore: Math.round(skillsSimilarity * 100),
      interestsScore: Math.round(interestsSimilarity * 100),
      roleSynergyScore: Math.round(roleSynergy * 100)
    },
    commonSkills,
    complementarySkills,
    commonInterests
  };
}
