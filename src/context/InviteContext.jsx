import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  createTeamInvite, 
  fetchInvites, 
  updateInviteStatus 
} from '../services/matchingService';
import confetti from 'canvas-confetti';

const InviteContext = createContext({});

export const useInvites = () => useContext(InviteContext);

export function InviteProvider({ children }) {
  const { currentUser, userProfile } = useAuth();
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshInvites = async () => {
    if (!currentUser) {
      setInvites([]);
      return;
    }
    setLoading(true);
    try {
      const list = await fetchInvites(currentUser.uid);
      setInvites(list);
    } catch (err) {
      console.error("Error loading invites:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshInvites();
  }, [currentUser]);

  // Invites received by the current user
  const receivedInvites = invites.filter(
    inv => inv.toUid === currentUser?.uid
  );

  // Invites sent by the current user
  const sentInvites = invites.filter(
    inv => inv.fromUid === currentUser?.uid
  );

  // Pending count for notification badge
  const pendingCount = receivedInvites.filter(
    inv => inv.status === 'pending'
  ).length;

  // Accepted teammates (squad)
  const acceptedTeammates = invites.filter(
    inv => (inv.fromUid === currentUser?.uid || inv.toUid === currentUser?.uid) && inv.status === 'accepted'
  );

  const sendInvite = async (candidate, matchScore) => {
    if (!currentUser) throw new Error("Please sign in to send invites");

    const senderProfile = userProfile || {
      uid: currentUser.uid,
      displayName: currentUser.displayName || currentUser.email?.split('@')[0],
      preferredRole: 'FullStack',
      photoURL: currentUser.photoURL
    };

    const newInvite = await createTeamInvite({
      fromUser: senderProfile,
      toUser: candidate,
      matchScore
    });

    setInvites(prev => [...prev, newInvite]);
    return newInvite;
  };

  const acceptInvite = async (inviteId) => {
    await updateInviteStatus(inviteId, 'accepted');
    setInvites(prev => prev.map(inv => 
      inv.id === inviteId ? { ...inv, status: 'accepted' } : inv
    ));

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  const declineInvite = async (inviteId) => {
    await updateInviteStatus(inviteId, 'declined');
    setInvites(prev => prev.map(inv => 
      inv.id === inviteId ? { ...inv, status: 'declined' } : inv
    ));
  };

  const hasInvited = (candidateUid) => {
    return sentInvites.some(
      inv => inv.toUid === candidateUid && inv.status !== 'declined'
    );
  };

  const value = {
    invites,
    receivedInvites,
    sentInvites,
    pendingCount,
    acceptedTeammates,
    loading,
    sendInvite,
    acceptInvite,
    declineInvite,
    hasInvited,
    refreshInvites
  };

  return (
    <InviteContext.Provider value={value}>
      {children}
    </InviteContext.Provider>
  );
}
