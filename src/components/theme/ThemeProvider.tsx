"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import {
  defaultThemeId,
  getThemeById,
  isThemeId,
  themePalettes,
  type ThemeId,
} from "@/lib/themes";

const THEME_STORAGE_KEY = "bookcrew_theme_id";

type ThemeContextValue = {
  themeId: ThemeId;
  setThemeId: (nextThemeId: ThemeId) => Promise<void>;
  themes: typeof themePalettes;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(themeId: ThemeId) {
  const theme = getThemeById(themeId);
  const root = document.documentElement;

  root.style.setProperty("--background", theme.background);
  root.style.setProperty("--foreground", theme.foreground);
  root.style.setProperty("--card", theme.card);
  root.style.setProperty("--muted", theme.muted);
  root.style.setProperty("--accent", theme.accent);
  root.style.setProperty("--accent-soft", theme.accentSoft);
}

function getUserThemeStorageKey(uid: string): string {
  return `${THEME_STORAGE_KEY}_${uid}`;
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>(() => {
    if (typeof window === "undefined") {
      return defaultThemeId;
    }

    const localTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return localTheme && isThemeId(localTheme) ? localTheme : defaultThemeId;
  });

  useEffect(() => {
    applyTheme(themeId);
  }, [themeId]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        const globalLocalTheme = localStorage.getItem(THEME_STORAGE_KEY);
        if (globalLocalTheme && isThemeId(globalLocalTheme)) {
          setThemeIdState(globalLocalTheme);
        } else {
          setThemeIdState(defaultThemeId);
        }
        return;
      }

      const userStorageKey = getUserThemeStorageKey(user.uid);
      const userLocalTheme = localStorage.getItem(userStorageKey);
      const globalLocalTheme = localStorage.getItem(THEME_STORAGE_KEY);
      const fallbackTheme = [userLocalTheme, globalLocalTheme].find(
        (candidate): candidate is ThemeId => Boolean(candidate && isThemeId(candidate)),
      );

      try {
        const profileRef = doc(db, "users", user.uid);
        const profileSnap = await getDoc(profileRef);
        const savedTheme = profileSnap.data()?.themeId;

        const resolvedTheme =
          typeof savedTheme === "string" && isThemeId(savedTheme)
            ? savedTheme
            : (fallbackTheme ?? defaultThemeId);

        setThemeIdState(resolvedTheme);
        localStorage.setItem(THEME_STORAGE_KEY, resolvedTheme);
        localStorage.setItem(userStorageKey, resolvedTheme);
      } catch {
        const resolvedTheme = fallbackTheme ?? defaultThemeId;
        setThemeIdState(resolvedTheme);
        localStorage.setItem(THEME_STORAGE_KEY, resolvedTheme);
        localStorage.setItem(userStorageKey, resolvedTheme);
      }
    });

    return () => unsubscribe();
  }, []);

  const setThemeId = useCallback(async (nextThemeId: ThemeId) => {
    setThemeIdState(nextThemeId);
    localStorage.setItem(THEME_STORAGE_KEY, nextThemeId);

    const user = auth.currentUser;

    if (!user) {
      return;
    }

    localStorage.setItem(getUserThemeStorageKey(user.uid), nextThemeId);

    try {
      const profileRef = doc(db, "users", user.uid);

      await setDoc(
        profileRef,
        {
          themeId: nextThemeId,
          themeUpdatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    } catch {
      // Keep applied theme even if sync fails.
    }
  }, []);

  const value = useMemo(
    () => ({
      themeId,
      setThemeId,
      themes: themePalettes,
    }),
    [setThemeId, themeId],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider.");
  }

  return context;
}
