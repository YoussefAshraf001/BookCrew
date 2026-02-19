"use client";

import { useEffect, useState } from "react";
import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useFirebaseApp } from "@/components/firebase/FirebaseAppProvider";
import { useToast } from "@/components/ui/ToastProvider";
import { buildBookDocId, shelfStatuses, type ShelfStatus } from "@/lib/status";

type BookStatusShortcutsProps = {
  book: {
    id: string;
    title: string;
    authors: string;
    thumbnail: string | null;
    publishedDate: string;
    publishedDateRaw: string | null;
  };
  compact?: boolean;
  iconFavorite?: boolean;
};

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3.5l2.7 5.47 6.04.88-4.37 4.25 1.03 6.01L12 17.26 6.6 20.11l1.03-6.01L3.26 9.85l6.04-.88L12 3.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

export default function BookStatusShortcuts({
  book,
  compact = false,
  iconFavorite = false,
}: BookStatusShortcutsProps) {
  const { user } = useFirebaseApp();
  const [selectedStatus, setSelectedStatus] = useState<ShelfStatus | null>(
    null,
  );
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  const statusLabelMap: Record<ShelfStatus, string> = {
    want: "Want to Read",
    reading: "Reading",
    read: "Read",
    paused: "Paused",
    dropped: "Dropped",
  };

  function getActionErrorMessage(caughtError: unknown): string {
    const code =
      caughtError && typeof caughtError === "object" && "code" in caughtError
        ? String(caughtError.code)
        : "";

    if (code === "permission-denied") {
      return "Firestore rules blocked this action. Update rules for users/{uid}/books/{status}/items/{docId}.";
    }

    return "Could not update Firebase right now.";
  }

  useEffect(() => {
    const bookDocId = buildBookDocId(book.title, book.id);

    async function loadSelections(uid: string) {
      try {
        const statusDocs = await Promise.all(
          shelfStatuses.map((status) =>
            getDoc(doc(db, "users", uid, "books", status, "items", bookDocId)),
          ),
        );

        const statusIndex = statusDocs.findIndex((snapshot) =>
          snapshot.exists(),
        );
        setSelectedStatus(statusIndex >= 0 ? shelfStatuses[statusIndex] : null);

        const favoriteDoc = await getDoc(
          doc(db, "users", uid, "books", "favorites", "items", bookDocId),
        );
        setIsFavorite(favoriteDoc.exists());
      } catch {
        setSelectedStatus(null);
        setIsFavorite(false);
      }
    }

    if (!user) {
      setSelectedStatus(null);
      setIsFavorite(false);
      return;
    }

    void loadSelections(user.uid);
  }, [book.id, book.title, user]);

  async function setStatus(status: ShelfStatus) {
    if (!user) {
      showToast("Sign in to set reading status.", "info");
      return;
    }

    if (selectedStatus === status) {
      showToast(
        `${book.title} is already set as ${statusLabelMap[status]}.`,
        "info",
      );
      return;
    }

    try {
      setIsSaving(true);
      const bookDocId = buildBookDocId(book.title, book.id);
      await Promise.all(
        shelfStatuses
          .filter((candidate) => candidate !== status)
          .map((candidate) =>
            deleteDoc(
              doc(
                db,
                "users",
                user.uid,
                "books",
                candidate,
                "items",
                bookDocId,
              ),
            ),
          ),
      );

      await setDoc(
        doc(db, "users", user.uid, "books", status, "items", bookDocId),
        {
          docId: bookDocId,
          bookId: book.id,
          title: book.title,
          authors: book.authors,
          thumbnail: book.thumbnail,
          publishedDate: book.publishedDate,
          publishedDateRaw: book.publishedDateRaw,
          statusId: status,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      setSelectedStatus(status);
      showToast(`${book.title} saved as ${statusLabelMap[status]}.`, "success");
    } catch (caughtError) {
      showToast(getActionErrorMessage(caughtError), "error");
    } finally {
      setIsSaving(false);
    }
  }

  async function clearStatus() {
    if (!user) {
      showToast("Sign in to edit reading status.", "info");
      return;
    }

    if (!selectedStatus) {
      showToast("No status is currently set for this book.", "info");
      return;
    }

    try {
      setIsSaving(true);
      const bookDocId = buildBookDocId(book.title, book.id);
      await Promise.all(
        shelfStatuses.map((status) =>
          deleteDoc(
            doc(db, "users", user.uid, "books", status, "items", bookDocId),
          ),
        ),
      );
      setSelectedStatus(null);
      showToast(`${book.title} removed from your lists.`, "success");
    } catch (caughtError) {
      showToast(getActionErrorMessage(caughtError), "error");
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleFavorite() {
    if (!user) {
      showToast("Sign in to use favorites.", "info");
      return;
    }

    try {
      setIsSaving(true);
      const bookDocId = buildBookDocId(book.title, book.id);
      const favoriteRef = doc(
        db,
        "users",
        user.uid,
        "books",
        "favorites",
        "items",
        bookDocId,
      );

      if (isFavorite) {
        await deleteDoc(favoriteRef);
        setIsFavorite(false);
        showToast("Removed from favorites.", "success");
      } else {
        await setDoc(
          favoriteRef,
          {
            docId: bookDocId,
            bookId: book.id,
            title: book.title,
            authors: book.authors,
            thumbnail: book.thumbnail,
            publishedDate: book.publishedDate,
            publishedDateRaw: book.publishedDateRaw,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
        setIsFavorite(true);
        showToast("Added to favorites.", "success");
      }
    } catch (caughtError) {
      showToast(getActionErrorMessage(caughtError), "error");
    } finally {
      setIsSaving(false);
    }
  }

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleFavorite}
              disabled={isSaving}
              aria-label={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
              className={[
                "inline-flex h-8 w-8 items-center justify-center rounded-full border transition disabled:opacity-55",
                isFavorite
                  ? "border-accent bg-accent text-white"
                  : "border-accent-soft bg-card text-accent hover:border-accent hover:bg-accent-soft/40",
              ].join(" ")}
            >
              <StarIcon filled={isFavorite} />
            </button>
            <button
              type="button"
              onClick={clearStatus}
              disabled={isSaving}
              aria-label="Remove from status lists"
              title="Remove from status lists"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-accent-soft bg-card text-accent transition hover:border-accent hover:bg-accent-soft/40 disabled:opacity-55"
            >
              <TrashIcon />
            </button>
          </div>

          <div className="grid w-full grid-cols-5 overflow-hidden rounded-full border border-accent-soft bg-card">
            <button
              type="button"
              onClick={() => setStatus("want")}
              disabled={isSaving}
              className={[
                "px-2 py-1.5 text-[11px] font-semibold transition disabled:opacity-55",
                selectedStatus === "want"
                  ? "bg-accent text-white"
                  : "text-accent hover:bg-accent-soft/40",
              ].join(" ")}
            >
              Want
            </button>
            <button
              type="button"
              onClick={() => setStatus("reading")}
              disabled={isSaving}
              className={[
                "border-l border-accent-soft px-2 py-1.5 text-[11px] font-semibold transition disabled:opacity-55",
                selectedStatus === "reading"
                  ? "bg-accent text-white"
                  : "text-accent hover:bg-accent-soft/40",
              ].join(" ")}
            >
              Reading
            </button>
            <button
              type="button"
              onClick={() => setStatus("read")}
              disabled={isSaving}
              className={[
                "border-l border-accent-soft px-2 py-1.5 text-[11px] font-semibold transition disabled:opacity-55",
                selectedStatus === "read"
                  ? "bg-accent text-white"
                  : "text-accent hover:bg-accent-soft/40",
              ].join(" ")}
            >
              Read
            </button>
            <button
              type="button"
              onClick={() => setStatus("paused")}
              disabled={isSaving}
              className={[
                "border-l border-accent-soft px-2 py-1.5 text-[11px] font-semibold transition disabled:opacity-55",
                selectedStatus === "paused"
                  ? "bg-accent text-white"
                  : "text-accent hover:bg-accent-soft/40",
              ].join(" ")}
            >
              On Hold
            </button>
            <button
              type="button"
              onClick={() => setStatus("dropped")}
              disabled={isSaving}
              className={[
                "border-l border-accent-soft px-2 py-1.5 text-[11px] font-semibold transition disabled:opacity-55",
                selectedStatus === "dropped"
                  ? "bg-accent text-white"
                  : "text-accent hover:bg-accent-soft/40",
              ].join(" ")}
            >
              Drop
            </button>
          </div>
        </div>
      </div>
    );
  }

  const regularButtonClass =
    "rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-55";

  return (
    <div className="space-y-2 space-x-2">
      {iconFavorite ? (
        <div className="flex justify-center items-center gap-2">
          <button
            type="button"
            onClick={toggleFavorite}
            disabled={isSaving}
            aria-label={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            className={[
              "inline-flex h-7 w-15 items-center justify-center rounded-full border transition disabled:opacity-55",
              isFavorite
                ? "border-accent bg-accent text-white"
                : "border-accent-soft bg-card text-accent hover:border-accent hover:bg-accent-soft/40",
            ].join(" ")}
          >
            <StarIcon filled={isFavorite} />
          </button>
          <button
            type="button"
            onClick={clearStatus}
            disabled={isSaving}
            aria-label="Remove from status lists"
            title="Remove from status lists"
            className="inline-flex h-7 w-15 items-center justify-center rounded-full border border-accent-soft bg-card text-accent transition hover:border-accent hover:bg-accent-soft/40 disabled:opacity-55"
          >
            <TrashIcon />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={toggleFavorite}
            disabled={isSaving}
            className={[
              regularButtonClass,
              isFavorite
                ? "bg-accent text-white"
                : "border border-accent-soft bg-card text-accent hover:border-accent hover:bg-accent-soft/40",
            ].join(" ")}
          >
            {isFavorite ? "Favorited" : "Favorite"}
          </button>
          <button
            type="button"
            onClick={clearStatus}
            disabled={isSaving}
            className="rounded-xl border border-accent-soft bg-card px-4 py-2.5 text-sm font-semibold text-accent transition hover:border-accent hover:bg-accent-soft/40 disabled:opacity-55"
          >
            Remove
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setStatus("want")}
        disabled={isSaving}
        className={[
          regularButtonClass,
          selectedStatus === "want"
            ? "bg-accent text-white"
            : "border border-accent-soft bg-card text-accent hover:border-accent hover:bg-accent-soft/40",
        ].join(" ")}
      >
        Want to Read
      </button>

      <button
        type="button"
        onClick={() => setStatus("reading")}
        disabled={isSaving}
        className={[
          regularButtonClass,
          selectedStatus === "reading"
            ? "bg-accent text-white"
            : "border border-accent-soft bg-card text-accent hover:border-accent hover:bg-accent-soft/40",
        ].join(" ")}
      >
        Reading
      </button>

      <button
        type="button"
        onClick={() => setStatus("read")}
        disabled={isSaving}
        className={[
          regularButtonClass,
          selectedStatus === "read"
            ? "bg-accent text-white"
            : "border border-accent-soft bg-card text-accent hover:border-accent hover:bg-accent-soft/40",
        ].join(" ")}
      >
        Read
      </button>

      <button
        type="button"
        onClick={() => setStatus("dropped")}
        disabled={isSaving}
        className={[
          regularButtonClass,
          selectedStatus === "dropped"
            ? "bg-accent text-white"
            : "border border-accent-soft bg-card text-accent hover:border-accent hover:bg-accent-soft/40",
        ].join(" ")}
      >
        Dropped
      </button>

      <button
        type="button"
        onClick={() => setStatus("paused")}
        disabled={isSaving}
        className={[
          regularButtonClass,
          selectedStatus === "paused"
            ? "bg-accent text-white"
            : "border border-accent-soft bg-card text-accent hover:border-accent hover:bg-accent-soft/40",
        ].join(" ")}
      >
        Paused
      </button>
    </div>
  );
}
