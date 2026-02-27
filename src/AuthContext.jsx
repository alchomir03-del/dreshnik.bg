import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import {
  doc, getDoc, setDoc, collection,
  writeBatch, deleteDoc, getDocs,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, googleProvider, db, storage } from "./firebase";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

// ============================================================
// Default profile & settings
// ============================================================
const DEFAULT_PROFILE = {
  displayName: "",
  photoURL: "",
  preferredStyles: [],
  bodyType: "",
  location: "",
  dailyBudget: 0,
  currency: "лв",
  shoeSize: "",
  topSize: "",
  bottomSize: "",
  bio: "",
  isPublic: false,
};

const DEFAULT_SETTINGS = {
  theme: "dark",
  currency: "лв",
  language: "bg",
  seasonalRotation: false,
  notifyMorningOutfit: true,
  notifyLaundryReminder: false,
  notifyWeeklyReport: false,
  measurementUnit: "EU",
};

// ============================================================
// Firestore helpers
// ============================================================
function userDoc(uid, path) {
  return doc(db, "users", uid, ...path.split("/").filter(Boolean));
}

function userCol(uid, col) {
  return collection(db, "users", uid, col);
}

// ============================================================
// Auth Provider
// ============================================================
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ---- Listen to auth state ----
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        await loadUserData(u.uid);
      } else {
        setProfile(DEFAULT_PROFILE);
        setSettings(DEFAULT_SETTINGS);
      }
      setLoading(false);
    });
    // Check redirect result (for mobile Google login)
    getRedirectResult(auth).catch(() => {});
    return unsub;
  }, []);

  // ---- Load profile + settings from Firestore ----
  const loadUserData = async (uid) => {
    try {
      const pSnap = await getDoc(doc(db, "users", uid));
      if (pSnap.exists()) {
        const data = pSnap.data();
        setProfile(p => ({ ...DEFAULT_PROFILE, ...data.profile }));
        setSettings(s => ({ ...DEFAULT_SETTINGS, ...data.settings }));
      }
    } catch (e) {
      console.warn("Load user data:", e);
    }
  };

  // ---- Refs for latest state (avoid stale closures) ----
  const profileRef = useRef(profile);
  const settingsRef = useRef(settings);
  useEffect(() => { profileRef.current = profile; }, [profile]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);

  // ---- Save profile to Firestore ----
  const saveProfile = useCallback(async (updates) => {
    if (!user) return;
    const merged = { ...profileRef.current, ...updates };
    setProfile(merged);
    profileRef.current = merged;
    try {
      await setDoc(doc(db, "users", user.uid), {
        profile: merged,
        settings: settingsRef.current,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (e) {
      console.warn("Save profile:", e);
    }
  }, [user]);

  // ---- Save settings to Firestore ----
  const saveSettings = useCallback(async (updates) => {
    if (!user) return;
    const merged = { ...settingsRef.current, ...updates };
    setSettings(merged);
    settingsRef.current = merged;
    try {
      await setDoc(doc(db, "users", user.uid), {
        profile: profileRef.current,
        settings: merged,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (e) {
      console.warn("Save settings:", e);
    }
  }, [user]);

  // ---- Auth methods ----
  const loginEmail = async (email, password) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      setError(mapAuthError(e.code));
      throw e;
    }
  };

  const registerEmail = async (email, password, name) => {
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      // Init Firestore profile
      await setDoc(doc(db, "users", cred.user.uid), {
        profile: { ...DEFAULT_PROFILE, displayName: name },
        settings: DEFAULT_SETTINGS,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      setError(mapAuthError(e.code));
      throw e;
    }
  };

  const loginGoogle = async () => {
    setError(null);
    try {
      // Try popup first, fall back to redirect on mobile
      try {
        const result = await signInWithPopup(auth, googleProvider);
        await ensureFirestoreProfile(result.user);
      } catch (popupErr) {
        if (popupErr.code === "auth/popup-blocked" ||
            popupErr.code === "auth/popup-closed-by-user") {
          await signInWithRedirect(auth, googleProvider);
        } else {
          throw popupErr;
        }
      }
    } catch (e) {
      setError(mapAuthError(e.code));
      throw e;
    }
  };

  const ensureFirestoreProfile = async (u) => {
    const snap = await getDoc(doc(db, "users", u.uid));
    if (!snap.exists()) {
      await setDoc(doc(db, "users", u.uid), {
        profile: {
          ...DEFAULT_PROFILE,
          displayName: u.displayName || "",
          photoURL: u.photoURL || "",
        },
        settings: DEFAULT_SETTINGS,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const logout = () => signOut(auth);

  const resetPassword = async (email) => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (e) {
      setError(mapAuthError(e.code));
      throw e;
    }
  };

  const deleteAccount = async (password) => {
    if (!user) return;
    try {
      // Re-authenticate if email user
      if (password && user.providerData[0]?.providerId === "password") {
        const cred = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, cred);
      }
      // Delete Firestore data
      const subcols = ["items", "outfits"];
      for (const col of subcols) {
        const snap = await getDocs(collection(db, "users", user.uid, col));
        const batch = writeBatch(db);
        snap.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
      }
      await deleteDoc(doc(db, "users", user.uid));
      await deleteUser(user);
    } catch (e) {
      setError(mapAuthError(e.code));
      throw e;
    }
  };

  // ---- Upload profile photo ----
  const uploadPhoto = async (file) => {
    if (!user) return null;
    const r = ref(storage, `avatars/${user.uid}`);
    await uploadBytes(r, file);
    const url = await getDownloadURL(r);
    await updateProfile(user, { photoURL: url });
    await saveProfile({ photoURL: url });
    return url;
  };

  // ---- Cloud sync: items ----
  const syncItems = useCallback(async (items) => {
    if (!user) return;
    try {
      // Save all items as single doc for simplicity
      await setDoc(doc(db, "users", user.uid, "data", "wardrobe"), {
        items,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn("Sync items:", e);
    }
  }, [user]);

  const loadItems = useCallback(async () => {
    if (!user) return null;
    try {
      const snap = await getDoc(doc(db, "users", user.uid, "data", "wardrobe"));
      if (snap.exists()) return snap.data().items || [];
      return null;
    } catch (e) {
      console.warn("Load items:", e);
      return null;
    }
  }, [user]);

  // ---- Cloud sync: outfits ----
  const syncOutfits = useCallback(async (outfits) => {
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user.uid, "data", "outfits"), {
        outfits,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn("Sync outfits:", e);
    }
  }, [user]);

  const loadOutfits = useCallback(async () => {
    if (!user) return null;
    try {
      const snap = await getDoc(doc(db, "users", user.uid, "data", "outfits"));
      if (snap.exists()) return snap.data().outfits || [];
      return null;
    } catch (e) {
      console.warn("Load outfits:", e);
      return null;
    }
  }, [user]);

  // ---- Cloud sync: calendar + blacklist + misc ----
  const syncMeta = useCallback(async (meta) => {
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user.uid, "data", "meta"), {
        ...meta,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn("Sync meta:", e);
    }
  }, [user]);

  const loadMeta = useCallback(async () => {
    if (!user) return null;
    try {
      const snap = await getDoc(doc(db, "users", user.uid, "data", "meta"));
      return snap.exists() ? snap.data() : null;
    } catch (e) {
      console.warn("Load meta:", e);
      return null;
    }
  }, [user]);

  // ---- Export data ----
  const exportData = useCallback(async () => {
    if (!user) return null;
    const items = await loadItems();
    const outfits = await loadOutfits();
    const meta = await loadMeta();
    return {
      profile,
      settings,
      items: items || [],
      outfits: outfits || [],
      calendar: meta?.calendar || {},
      blacklist: meta?.blacklist || [],
      exportedAt: new Date().toISOString(),
    };
  }, [user, profile, settings, loadItems, loadOutfits, loadMeta]);

  const value = {
    user, profile, settings, loading, error,
    loginEmail, registerEmail, loginGoogle, logout,
    resetPassword, deleteAccount,
    saveProfile, saveSettings, uploadPhoto,
    syncItems, loadItems,
    syncOutfits, loadOutfits,
    syncMeta, loadMeta,
    exportData,
    setError,
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

// ============================================================
// Auth error mapper
// ============================================================
function mapAuthError(code) {
  const map = {
    "auth/email-already-in-use": "This email is already registered.",
    "auth/invalid-email": "Invalid email address.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/too-many-requests": "Too many attempts. Try again later.",
    "auth/popup-closed-by-user": "Login cancelled.",
    "auth/network-request-failed": "Network error. Check your connection.",
    "auth/requires-recent-login": "Please log in again to complete this action.",
  };
  return map[code] || "Something went wrong. Please try again.";
}

export { DEFAULT_PROFILE, DEFAULT_SETTINGS };
