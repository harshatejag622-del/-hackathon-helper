import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  isConfigured
} from '../firebase/config';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [isTeamLead, setIsTeamLead] = useState(() => {
    return sessionStorage.getItem('hh_is_team_lead') === 'true' || localStorage.getItem('hh_is_team_lead') === 'true';
  });

  // Sync auth state listener with per-tab session isolation
  useEffect(() => {
    // 1. Check tab-specific sessionStorage first (allows Tab 1 = Teja, Tab 2 = Friend)
    const sessionUser = sessionStorage.getItem('hh_session_user');
    const sessionProfile = sessionStorage.getItem('hh_session_profile');
    if (sessionUser) {
      try {
        setCurrentUser(JSON.parse(sessionUser));
        if (sessionProfile) setUserProfile(JSON.parse(sessionProfile));
        setLoading(false);
        return;
      } catch (e) {
        console.error("Failed to parse tab session:", e);
      }
    }

    // If this tab doesn't have an active session yet, start clean so the user can log in with another email
    if (!isConfigured) {
      // If there was a previous single-tab session and no sessionUser exists, load once
      const savedMockUser = localStorage.getItem('hh_mock_user');
      const savedMockProfile = localStorage.getItem('hh_mock_profile');
      const sessionStarted = sessionStorage.getItem('hh_session_started');
      
      if (!sessionStarted && savedMockUser) {
        try {
          const u = JSON.parse(savedMockUser);
          setCurrentUser(u);
          sessionStorage.setItem('hh_session_user', JSON.stringify(u));
          sessionStorage.setItem('hh_session_started', 'true');
          if (savedMockProfile) {
            const p = JSON.parse(savedMockProfile);
            setUserProfile(p);
            sessionStorage.setItem('hh_session_profile', JSON.stringify(p));
          }
        } catch (e) {}
      } else {
        sessionStorage.setItem('hh_session_started', 'true');
      }
      setLoading(false);
      return;
    }

    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        sessionStorage.setItem('hh_session_user', JSON.stringify({
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL
        }));
        await loadUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch Firestore profile for a user
  const loadUserProfile = async (uid) => {
    try {
      if (db && isConfigured) {
        const userDocRef = doc(db, 'users', uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          setUserProfile(docSnap.data());
          return docSnap.data();
        }
      }
      
      // Check localStorage cached profile
      const localProfile = localStorage.getItem(`hh_profile_${uid}`);
      if (localProfile) {
        const parsed = JSON.parse(localProfile);
        setUserProfile(parsed);
        return parsed;
      }
    } catch (err) {
      console.warn("Could not read Firestore document directly:", err.message);
      const localProfile = localStorage.getItem(`hh_profile_${uid}`);
      if (localProfile) {
        setUserProfile(JSON.parse(localProfile));
      }
    }
    return null;
  };

  // Google Sign-In
  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      if (isConfigured && auth && googleProvider) {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        setCurrentUser(user);
        await loadUserProfile(user.uid);
        return user;
      }
    } catch (err) {
      console.warn("Live Firebase Google login notice, falling back to simulated Google session:", err.message);
    }

    // High-fidelity fallback simulated Google authentication
    const demoUser = {
      uid: 'google-demo-uid-' + Math.random().toString(36).substring(2, 9),
      displayName: 'Alex Chen',
      email: 'alex.chen.innovator@gmail.com',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      providerId: 'google.com'
    };
    setCurrentUser(demoUser);
    localStorage.setItem('hh_mock_user', JSON.stringify(demoUser));
    await loadUserProfile(demoUser.uid);
    return demoUser;
  };

  // Email/Password Registration
  const signupWithEmail = async (email, password, displayName) => {
    setAuthError(null);
    try {
      if (isConfigured && auth) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        if (displayName) {
          await updateProfile(user, { displayName });
        }
        setCurrentUser({ ...user, displayName });
        return user;
      }
    } catch (err) {
      console.warn("Firebase Email sign up notice, falling back to local registration:", err.message);
      if (isConfigured) {
        setAuthError(err.message);
        throw err;
      }
    }

    const registeredUser = {
      uid: 'user-' + Math.random().toString(36).substring(2, 9),
      displayName: displayName || email.split('@')[0],
      email: email,
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
      providerId: 'password'
    };
    setCurrentUser(registeredUser);
    sessionStorage.setItem('hh_session_user', JSON.stringify(registeredUser));
    localStorage.setItem('hh_mock_user', JSON.stringify(registeredUser));

    // Register into shared community users
    try {
      const allUsers = JSON.parse(localStorage.getItem('hh_all_community_users') || '[]');
      const filtered = allUsers.filter(u => u.uid !== registeredUser.uid);
      filtered.push({
        uid: registeredUser.uid,
        displayName: registeredUser.displayName,
        email: registeredUser.email,
        preferredRole: 'FullStack',
        skills: ['React', 'JavaScript', 'Python'],
        interests: ['Artificial Intelligence', 'Web3 & Crypto'],
        college: 'Innovation University',
        photoURL: registeredUser.photoURL
      });
      localStorage.setItem('hh_all_community_users', JSON.stringify(filtered));
    } catch (e) {}

    return registeredUser;
  };

  // Email/Password Login
  const loginWithEmail = async (email, password) => {
    setAuthError(null);
    try {
      if (isConfigured && auth) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        setCurrentUser(user);
        await loadUserProfile(user.uid);
        return user;
      }
    } catch (err) {
      console.warn("Firebase Email login notice, falling back to demo session:", err.message);
      if (isConfigured) {
        setAuthError(err.message);
        throw err;
      }
    }

    // Check if user previously registered in community users
    const allUsers = JSON.parse(localStorage.getItem('hh_all_community_users') || '[]');
    const existing = allUsers.find(u => u.email?.toLowerCase() === email.toLowerCase());

    const activeUser = existing ? {
      uid: existing.uid,
      displayName: existing.displayName || email.split('@')[0],
      email: existing.email || email,
      photoURL: existing.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
      providerId: 'password'
    } : {
      uid: 'user-' + email.replace(/[^a-zA-Z0-9]/g, '_'),
      displayName: email.split('@')[0],
      email: email,
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
      providerId: 'password'
    };

    setCurrentUser(activeUser);
    sessionStorage.setItem('hh_session_user', JSON.stringify(activeUser));

    // Restore all features (skills, role, college, bio) if already saved
    if (existing) {
      setUserProfile(existing);
      sessionStorage.setItem('hh_session_profile', JSON.stringify(existing));
    } else {
      await loadUserProfile(activeUser.uid);
    }
    return activeUser;
  };

  // Save/Update Profile to Firestore
  const saveProfile = async (profileData) => {
    if (!currentUser) throw new Error("User must be authenticated to save profile");

    const fullProfile = {
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: profileData.name || currentUser.displayName,
      college: profileData.college || '',
      year: profileData.year || '3rd Year',
      skills: profileData.skills || [],
      interests: profileData.interests || [],
      availability: profileData.availability || 'Full-time',
      preferredRole: profileData.preferredRole || 'Full Stack',
      bio: profileData.bio || '',
      github: profileData.github || '',
      isProfileComplete: true,
      updatedAt: new Date().toISOString()
    };

    // Save to Firestore if configured
    try {
      if (db && isConfigured) {
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, {
          ...fullProfile,
          serverUpdatedAt: serverTimestamp()
        }, { merge: true });
      }
    } catch (err) {
      console.warn("Could not write to live Firestore, caching locally:", err.message);
    }

    // Always persist to local cache for instant zero-latency UI updates
    sessionStorage.setItem('hh_session_profile', JSON.stringify(fullProfile));
    localStorage.setItem(`hh_profile_${currentUser.uid}`, JSON.stringify(fullProfile));
    localStorage.setItem('hh_mock_profile', JSON.stringify(fullProfile));
    setUserProfile(fullProfile);

    // Persist into shared community participants so everyone can see & invite this real person!
    try {
      const allCommunity = JSON.parse(localStorage.getItem('hh_all_community_users') || '[]');
      const filtered = allCommunity.filter(u => u.uid !== fullProfile.uid);
      filtered.unshift(fullProfile);
      localStorage.setItem('hh_all_community_users', JSON.stringify(filtered));

      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('hh_team_sync_channel');
        bc.postMessage({ type: 'profile_updated', profile: fullProfile });
        bc.close();
      }
    } catch (e) {}

    return fullProfile;
  };

  // Toggle Team Lead status
  const toggleTeamLead = (status) => {
    const nextVal = typeof status === 'boolean' ? status : !isTeamLead;
    setIsTeamLead(nextVal);
    sessionStorage.setItem('hh_is_team_lead', String(nextVal));
    localStorage.setItem('hh_is_team_lead', String(nextVal));
    
    // Broadcast role change across tabs
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const bc = new BroadcastChannel('hh_team_sync_channel');
      bc.postMessage({
        type: 'role_update',
        data: { uid: currentUser?.uid, isTeamLead: nextVal, displayName: currentUser?.displayName }
      });
      bc.close();
    }
  };

  // Quick switch active account in current tab (for effortless 2-tab testing)
  const quickSwitchMember = (member) => {
    const active = {
      uid: member.uid,
      displayName: member.displayName,
      email: member.email || `${member.uid}@hackathon.edu`,
      photoURL: member.photoURL,
      providerId: 'demo'
    };
    const prof = {
      uid: member.uid,
      displayName: member.displayName,
      preferredRole: member.preferredRole || 'Developer',
      skills: member.skills || ['React', 'JavaScript'],
      interests: member.interests || ['AI', 'Web'],
      college: member.college || 'Engineering College',
      bio: member.bio || ''
    };
    setCurrentUser(active);
    setUserProfile(prof);
    sessionStorage.setItem('hh_session_user', JSON.stringify(active));
    sessionStorage.setItem('hh_session_profile', JSON.stringify(prof));
    setIsTeamLead(member.isLead || false);
    sessionStorage.setItem('hh_is_team_lead', String(member.isLead || false));
  };

  // Sign Out
  const logout = async () => {
    try {
      if (auth && isConfigured) {
        await signOut(auth);
      }
    } catch (err) {
      console.warn("Sign out error:", err);
    }
    setCurrentUser(null);
    setUserProfile(null);
    sessionStorage.removeItem('hh_session_user');
    sessionStorage.removeItem('hh_session_profile');
    sessionStorage.removeItem('hh_is_team_lead');
    localStorage.removeItem('hh_mock_user');
    localStorage.removeItem('hh_mock_profile');
  };

  const value = {
    currentUser,
    userProfile,
    isTeamLead,
    toggleTeamLead,
    quickSwitchMember,
    loading,
    authError,
    setAuthError,
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
    saveProfile,
    logout,
    isConfigured
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
