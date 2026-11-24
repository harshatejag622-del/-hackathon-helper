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

  // Real-time cross-tab invite synchronization via BroadcastChannel
  useEffect(() => {
    let bc;
    try {
      bc = new BroadcastChannel('hh_team_invites_channel');
      bc.onmessage = (event) => {
        const { type, invite, inviteId } = event.data || {};
        if (type === 'invite_sent' && invite) {
          setInvites(prev => {
            const exists = prev.some(i => i.id === invite.id);
            if (!exists) return [...prev, invite];
            return prev;
          });
          // If this tab is the recipient, play subtle alert
          if (currentUser && invite.toUid === currentUser.uid) {
            try {
              const ctx = new (window.AudioContext || window.webkitAudioContext)();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.frequency.setValueAtTime(523.25, ctx.currentTime);
              osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.15);
              gain.gain.setValueAtTime(0.15, ctx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start();
              osc.stop(ctx.currentTime + 0.4);
            } catch(e) {}
          }
        } else if (type === 'invite_accepted' && inviteId) {
          setInvites(prev => prev.map(inv => 
            inv.id === inviteId ? { ...inv, status: 'accepted' } : inv
          ));
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 }
          });
        } else if (type === 'invite_declined' && inviteId) {
          setInvites(prev => prev.map(inv => 
            inv.id === inviteId ? { ...inv, status: 'declined' } : inv
          ));
        }
      };
    } catch (e) {
      console.warn("Invite BroadcastChannel init notice:", e);
    }

    return () => {
      if (bc) bc.close();
    };
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

  // Accepted teammates (Group/Squad)
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

    // Broadcast invite across all tabs in real time
    try {
      const bc = new BroadcastChannel('hh_team_invites_channel');
      bc.postMessage({ type: 'invite_sent', invite: newInvite });
      bc.close();
    } catch (e) {}

    return newInvite;
  };

  const acceptInvite = async (inviteId) => {
    await updateInviteStatus(inviteId, 'accepted');
    setInvites(prev => prev.map(inv => 
      inv.id === inviteId ? { ...inv, status: 'accepted' } : inv
    ));

    // Broadcast acceptance across all tabs
    try {
      const bc = new BroadcastChannel('hh_team_invites_channel');
      bc.postMessage({ type: 'invite_accepted', inviteId });
      bc.close();
    } catch (e) {}

    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const declineInvite = async (inviteId) => {
    await updateInviteStatus(inviteId, 'declined');
    setInvites(prev => prev.map(inv => 
      inv.id === inviteId ? { ...inv, status: 'declined' } : inv
    ));

    try {
      const bc = new BroadcastChannel('hh_team_invites_channel');
      bc.postMessage({ type: 'invite_declined', inviteId });
      bc.close();
    } catch (e) {}
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
