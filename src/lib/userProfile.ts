import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "@/lib/firebase";

export async function upsertUserProfile(
  user: User,
  preferredDisplayName?: string,
) {
  const profileRef = doc(db, "users", user.uid);
  const profileSnap = await getDoc(profileRef);

  await setDoc(
    profileRef,
    {
      uid: user.uid,
      email: user.email ?? "",
      displayName: preferredDisplayName || user.displayName || "Reader",
      emailVerified: user.emailVerified,
      themeId: profileSnap.data()?.themeId ?? "classic-paper",
      createdAt: profileSnap.exists()
        ? (profileSnap.data()?.createdAt ?? serverTimestamp())
        : serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

