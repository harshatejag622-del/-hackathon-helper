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
import { cloudSync } from './cloudSyncService';

// Community participants list (empty by default - populated by real registered users!)
export const DEFAULT_PARTICIPANTS = [];

// Fetch all real participants from Firestore and community registrations
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

  // 2. Fetch all real registered community users (from this computer & other tabs)
  try {
    const communityUsers = JSON.parse(localStorage.getItem('hh_all_community_users') || '[]');
    const existingIds = new Set(participants.map(p => p.uid));
    communityUsers.forEach(u => {
      if (u.uid !== currentUserId && !existingIds.has(u.uid)) {
        participants.push(u);
        existingIds.add(u.uid);
      }
    });
  } catch (e) {}

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

  // Broadcast invite across all laptops and tabs via CloudSync
  cloudSync.publish('INVITE_SENT', invite);

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

  // Broadcast invite status across all laptops
  if (status === 'accepted') {
    cloudSync.publish('INVITE_ACCEPTED', { inviteId, status });
  } else if (status === 'declined') {
    cloudSync.publish('INVITE_DECLINED', { inviteId, status });
  }

  return true;
}
