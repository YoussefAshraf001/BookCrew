"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { collection, doc, onSnapshot, type DocumentData } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { shelfStatuses, type ShelfStatus } from "@/lib/status";

export type UserProfile = {
  displayName?: string;
  bio?: string;
  profileImageBase64?: string;
  bannerImageBase64?: string;
  readingGoal?: number;
  createdAt?: unknown;
  themeId?: string;
  emailVerified?: boolean;
};

export type StoredBook = {
  docId: string;
  bookId: string;
  title: string;
  authors: string;
  publishedDate: string;
  publishedDateRaw: string | null;
  thumbnail: string | null;
  statusId?: string;
};

type StatusShelfMap = Record<ShelfStatus, StoredBook[]>;

const emptyShelves: StatusShelfMap = {
  want: [],
  reading: [],
  read: [],
  dropped: [],
  paused: [],
};

function mapStoredBook(data: DocumentData, docId: string): StoredBook {
  return {
    docId,
    bookId: String(data.bookId ?? docId),
    title: String(data.title ?? "Untitled"),
    authors: String(data.authors ?? "Unknown author"),
    publishedDate: String(data.publishedDate ?? "Unknown"),
    publishedDateRaw:
      typeof data.publishedDateRaw === "string" ? data.publishedDateRaw : null,
    thumbnail: typeof data.thumbnail === "string" ? data.thumbnail : null,
    statusId: typeof data.statusId === "string" ? data.statusId : undefined,
  };
}

function mergeStoredBooks(primary: StoredBook[], legacy: StoredBook[]): StoredBook[] {
  const merged = new Map<string, StoredBook>();

  [...primary, ...legacy].forEach((book) => {
    const key = book.bookId || book.docId;
    if (!merged.has(key)) {
      merged.set(key, book);
    }
  });

  return [...merged.values()];
}

type FirebaseAppContextValue = {
  user: User | null;
  authReady: boolean;
  profile: UserProfile | null;
  profilePermissionDenied: boolean;
  shelves: StatusShelfMap;
  favorites: StoredBook[];
  shelfPermissionDenied: boolean;
};

const FirebaseAppContext = createContext<FirebaseAppContextValue | null>(null);

export default function FirebaseAppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [authReady, setAuthReady] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profilePermissionDenied, setProfilePermissionDenied] = useState(false);
  const [shelves, setShelves] = useState<StatusShelfMap>(emptyShelves);
  const [favorites, setFavorites] = useState<StoredBook[]>([]);
  const [shelfPermissionDenied, setShelfPermissionDenied] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);

      if (!nextUser) {
        setProfile(null);
        setProfilePermissionDenied(false);
        setShelves(emptyShelves);
        setFavorites([]);
        setShelfPermissionDenied(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    const profileRef = doc(db, "users", user.uid);
    const unsubscribeProfile = onSnapshot(
      profileRef,
      (snapshot) => {
        setProfilePermissionDenied(false);
        setProfile((snapshot.data() as UserProfile | undefined) ?? null);
      },
      (error) => {
        if (error.code === "permission-denied") {
          setProfilePermissionDenied(true);
        }
      },
    );

    const primaryShelfDocs: Partial<Record<ShelfStatus, StoredBook[]>> = {};
    const legacyShelfDocs: Partial<Record<ShelfStatus, StoredBook[]>> = {};

    function syncStatus(status: ShelfStatus) {
      setShelves((current) => ({
        ...current,
        [status]: mergeStoredBooks(primaryShelfDocs[status] ?? [], legacyShelfDocs[status] ?? []),
      }));
    }

    const shelfUnsubscribers = shelfStatuses.flatMap((status) => [
      onSnapshot(
        collection(db, "users", user.uid, "books", status, "items"),
        (snapshot) => {
          setShelfPermissionDenied(false);
          primaryShelfDocs[status] = snapshot.docs.map((docSnap) =>
            mapStoredBook(docSnap.data(), docSnap.id),
          );
          syncStatus(status);
        },
        (error) => {
          if (error.code === "permission-denied") {
            setShelfPermissionDenied(true);
          }
        },
      ),
      onSnapshot(
        collection(db, "users", user.uid, "status", status, "books"),
        (snapshot) => {
          setShelfPermissionDenied(false);
          legacyShelfDocs[status] = snapshot.docs.map((docSnap) =>
            mapStoredBook(docSnap.data(), docSnap.id),
          );
          syncStatus(status);
        },
        (error) => {
          if (error.code === "permission-denied") {
            setShelfPermissionDenied(true);
          }
        },
      ),
    ]);

    const unsubscribeFavorites = onSnapshot(
      collection(db, "users", user.uid, "books", "favorites", "items"),
      (snapshot) => {
        setShelfPermissionDenied(false);
        setFavorites(snapshot.docs.map((docSnap) => mapStoredBook(docSnap.data(), docSnap.id)));
      },
      (error) => {
        if (error.code === "permission-denied") {
          setShelfPermissionDenied(true);
        }
      },
    );

    return () => {
      unsubscribeProfile();
      shelfUnsubscribers.forEach((unsubscribe) => unsubscribe());
      unsubscribeFavorites();
    };
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      authReady,
      profile,
      profilePermissionDenied,
      shelves,
      favorites,
      shelfPermissionDenied,
    }),
    [
      authReady,
      favorites,
      profile,
      profilePermissionDenied,
      shelfPermissionDenied,
      shelves,
      user,
    ],
  );

  return <FirebaseAppContext.Provider value={value}>{children}</FirebaseAppContext.Provider>;
}

export function useFirebaseApp() {
  const context = useContext(FirebaseAppContext);

  if (!context) {
    throw new Error("useFirebaseApp must be used inside FirebaseAppProvider.");
  }

  return context;
}
