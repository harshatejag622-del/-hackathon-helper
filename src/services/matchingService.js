import { 
  db, 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp, 
  isConfigured 
} from '../firebase/config';
import { collection, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { calculateCandidateMatch } from '../utils/cosineMatching';

// Realistic pre-seeded pool of hackathon candidates across diverse domains
export const DEFAULT_PARTICIPANTS = [
  {
    uid: 'candidate_priya_sharma',
    displayName: 'Priya Sharma',
    college: 'UC Berkeley',
    year: '4th Year',
    preferredRole: 'ML',
    skills: ['Python', 'PyTorch', 'FastAPI', 'Machine Learning', 'Docker', 'NLP'],
    interests: ['Artificial Intelligence', 'GenAI & LLMs', 'HealthTech & Bio'],
    availability: 'Full-time',
    bio: 'ML researcher focusing on biomedical LLMs and low-latency inference pipelines.',
    github: 'priyasharma-ai',
    photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
  },
  {
    uid: 'candidate_marcus_vance',
    displayName: 'Marcus Vance',
    college: 'Stanford University',
    year: '3rd Year',
    preferredRole: 'Backend',
    skills: ['Node.js', 'Go', 'PostgreSQL', 'Docker', 'AWS', 'Python', 'TypeScript'],
    interests: ['FinTech & DeFi', 'Sustainability & CleanTech', 'Smart Cities & IoT'],
    availability: 'Full-time',
    bio: 'Distributed systems nerd. I build fault-tolerant databases and microservices that never crash.',
    github: 'marcus-sys',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
  },
  {
    uid: 'candidate_elena_rostova',
    displayName: 'Elena Rostova',
    college: 'MIT',
    year: '2nd Year',
    preferredRole: 'Design',
    skills: ['UI/UX Design', 'Figma', 'Tailwind CSS', 'React', 'TypeScript'],
    interests: ['Gaming & XR', 'Artificial Intelligence', 'EdTech'],
    availability: 'Full-time',
    bio: 'Product designer obsessed with fluid 3D micro-interactions, dark mode, and design systems.',
    github: 'elena-ux',
    photoURL: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200'
  },
  {
    uid: 'candidate_devon_kim',
    displayName: 'Devon Kim',
    college: 'University of Waterloo',
    year: '4th Year',
    preferredRole: 'Frontend',
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'UI/UX Design'],
    interests: ['Web3 & Crypto', 'FinTech & DeFi', 'Artificial Intelligence'],
    availability: 'Full-time',
    bio: 'Frontend wizard creating high-framerate React & WebGL interactive dashboard applications.',
    github: 'devon-frontend',
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
  },
  {
    uid: 'candidate_aisha_tariq',
    displayName: 'Aisha Tariq',
    college: 'Carnegie Mellon',
    year: 'Postgraduate / PhD',
    preferredRole: 'DevOps',
    skills: ['Kubernetes', 'Docker', 'AWS', 'Go', 'Python', 'PostgreSQL'],
    interests: ['CyberSecurity', 'Smart Cities & IoT', 'Artificial Intelligence'],
    availability: 'Part-time',
    bio: 'Site Reliability & Cloud Infrastructure specialist. Zero-downtime deployments under pressure.',
    github: 'aisha-ops',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
  },
  {
    uid: 'candidate_lucas_silva',
    displayName: 'Lucas Silva',
    college: 'Georgia Tech',
    year: '3rd Year',
    preferredRole: 'FullStack',
    skills: ['React', 'Node.js', 'Python', 'FastAPI', 'MongoDB', 'Solidity', 'Web3'],
    interests: ['Web3 & Crypto', 'Sustainability & CleanTech', 'GenAI & LLMs'],
    availability: 'Full-time',
    bio: 'Full stack hacker who built 3 top-ranking hackathon projects. Fast scripter and pitcher.',
    github: 'lucas-hack',
    photoURL: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200'
  }
];

// Fetch all participants from Firestore and community registrations
export async function fetchAllParticipants(currentUserId) {
  let participants = [];

  // 1. Fetch from live Firestore if configured
  try {
    if (db && isConfigured) {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data.uid !== currentUserId) {
          participants.push({ ...data, id: docSnap.id });
        }
      });
    }
  } catch (err) {
    console.warn("Could not fetch participants from live Firestore:", err.message);
  }

  // 2. Fetch all real registered community users
  try {
    const communityUsers = JSON.parse(localStorage.getItem('hh_all_community_users') || '[]');
    const existingIds = new Set(participants.map(p => p.uid));
    communityUsers.forEach(u => {
      if (u.uid !== currentUserId && !existingIds.has(u.uid)) {
        participants.unshift(u); // Put real registered users first!
        existingIds.add(u.uid);
      }
    });
  } catch (e) {}

  // 3. Fallback candidates to ensure candidate list is always rich
  const existingIds = new Set(participants.map(p => p.uid));
  DEFAULT_PARTICIPANTS.forEach(candidate => {
    if (!existingIds.has(candidate.uid) && candidate.uid !== currentUserId) {
      participants.push(candidate);
    }
  });

  return participants;
}

// Compute top N matches for current user
export function getTopMatches(currentUserProfile, participants, limit = 5) {
  if (!currentUserProfile || !participants?.length) return [];

  const evaluated = participants.map(candidate => {
    const matchResult = calculateCandidateMatch(currentUserProfile, candidate);
    return {
      ...candidate,
      match: matchResult
    };
  });

  // Sort descending by percentage score
  evaluated.sort((a, b) => b.match.percentage - a.match.percentage);

  return evaluated.slice(0, limit);
}

// Send an invite (saves to Firestore 'invites' collection + local state)
export async function createTeamInvite({ fromUser, toUser, matchScore }) {
  const inviteId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const invite = {
    id: inviteId,
    fromUid: fromUser.uid,
    fromName: fromUser.displayName || fromUser.email?.split('@')[0] || 'Innovator',
    fromRole: fromUser.preferredRole || 'FullStack',
    fromPhoto: fromUser.photoURL || null,
    toUid: toUser.uid,
    toName: toUser.displayName,
    toRole: toUser.preferredRole,
    matchScore: matchScore || 90,
    status: 'pending', // 'pending' | 'accepted' | 'declined'
    createdAt: new Date().toISOString()
  };

  try {
    if (db && isConfigured) {
      const inviteRef = doc(db, 'invites', inviteId);
      await setDoc(inviteRef, {
        ...invite,
        serverCreatedAt: serverTimestamp()
      });
    }
  } catch (e) {
    console.warn("Firestore invite write notice, saving locally:", e.message);
  }

  // Save to localStorage invites list
  const existing = JSON.parse(localStorage.getItem('hh_invites') || '[]');
  existing.push(invite);
  localStorage.setItem('hh_invites', JSON.stringify(existing));

  return invite;
}

// Fetch all invites for current user (both received and sent)
export async function fetchInvites(userId) {
  let allInvites = [];

  try {
    if (db && isConfigured) {
      const q = query(
        collection(db, 'invites'),
        where('toUid', '==', userId)
      );
      const snapshot = await getDocs(q);
      snapshot.forEach(docSnap => {
        allInvites.push({ ...docSnap.data(), id: docSnap.id });
      });
    }
  } catch (err) {
    console.warn("Using local invite cache:", err.message);
  }

  // Merge local storage invites
  const localInvites = JSON.parse(localStorage.getItem('hh_invites') || '[]');
  const idMap = new Map();
  allInvites.forEach(inv => idMap.set(inv.id, inv));
  localInvites.forEach(inv => {
    if (!idMap.has(inv.id)) {
      idMap.set(inv.id, inv);
    }
  });

  return Array.from(idMap.values());
}

// Update invite status
export async function updateInviteStatus(inviteId, status) {
  try {
    if (db && isConfigured) {
      const ref = doc(db, 'invites', inviteId);
      await updateDoc(ref, { status });
    }
  } catch (e) {
    console.warn("Could not update live Firestore invite:", e.message);
  }

  // Update local storage
  const localInvites = JSON.parse(localStorage.getItem('hh_invites') || '[]');
  const updated = localInvites.map(inv => inv.id === inviteId ? { ...inv, status } : inv);
  localStorage.setItem('hh_invites', JSON.stringify(updated));

  return true;
}
