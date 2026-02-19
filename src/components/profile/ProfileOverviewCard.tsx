"use client";

import { useEffect, useMemo, useState } from "react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import Cropper, { type Area } from "react-easy-crop";
import { db } from "@/lib/firebase";
import { useFirebaseApp } from "@/components/firebase/FirebaseAppProvider";
import { useToast } from "@/components/ui/ToastProvider";

type CropTarget = "profile" | "banner";

function PencilIcon() {
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
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function isGifFile(file: File): boolean {
  return file.type === "image/gif" || file.name.toLowerCase().endsWith(".gif");
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Failed to convert file."));
    reader.readAsDataURL(file);
  });
}

function createImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load image."));
    image.src = src;
  });
}

async function getCroppedDataUrl(
  imageSrc: string,
  crop: Area,
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(crop.width));
  canvas.height = Math.max(1, Math.round(crop.height));
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not initialize canvas.");
  }

  context.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  return canvas.toDataURL("image/jpeg", 0.92);
}

export default function ProfileOverviewCard() {
  const { user, profile, shelves, profilePermissionDenied } = useFirebaseApp();
  const [displayName, setDisplayName] = useState("Reader");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [readingGoal, setReadingGoal] = useState(24);
  const [goalDraft, setGoalDraft] = useState(24);
  const [completedCount, setCompletedCount] = useState(0);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [cropTarget, setCropTarget] = useState<CropTarget | null>(null);
  const [cropSource, setCropSource] = useState("");
  const [cropZoom, setCropZoom] = useState(1);
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
  const [croppedPixels, setCroppedPixels] = useState<Area | null>(null);
  const [isSavingCrop, setIsSavingCrop] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [bioDraft, setBioDraft] = useState("");
  const [isSavingIdentity, setIsSavingIdentity] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (!user) {
      setDisplayName("Reader");
      setBio("");
      setProfileImage(null);
      setBannerImage(null);
      setReadingGoal(24);
      setGoalDraft(24);
      setCompletedCount(0);
      return;
    }

    setDisplayName(
      typeof profile?.displayName === "string"
        ? profile.displayName
        : user.displayName || "Reader",
    );
    setBio(typeof profile?.bio === "string" ? profile.bio : "");
    setProfileImage(
      typeof profile?.profileImageBase64 === "string"
        ? profile.profileImageBase64
        : null,
    );
    setBannerImage(
      typeof profile?.bannerImageBase64 === "string"
        ? profile.bannerImageBase64
        : null,
    );
    const nextGoal =
      typeof profile?.readingGoal === "number" && profile.readingGoal > 0
        ? profile.readingGoal
        : 24;
    setReadingGoal(nextGoal);
    setGoalDraft(nextGoal);
    setCompletedCount(shelves.read.length);
    setNameDraft(
      typeof profile?.displayName === "string"
        ? profile.displayName
        : user.displayName || "Reader",
    );
    setBioDraft(typeof profile?.bio === "string" ? profile.bio : "");
  }, [profile, shelves.read.length, user]);

  useEffect(() => {
    if (profilePermissionDenied) {
      showToast("Firestore rules blocked profile reads.", "error");
    }
  }, [profilePermissionDenied, showToast]);

  const completionText = useMemo(
    () => `${completedCount} completed`,
    [completedCount],
  );

  async function saveGoal() {
    if (!user) {
      showToast("Sign in required to update reading goal.", "info");
      return;
    }

    const normalized = Math.min(300, Math.max(1, goalDraft));

    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          readingGoal: normalized,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      setReadingGoal(normalized);
      setGoalDraft(normalized);
      setIsGoalModalOpen(false);
      showToast("Reading goal updated.", "success");
    } catch {
      showToast("Could not update reading goal.", "error");
    }
  }

  async function saveIdentity() {
    if (!user) {
      showToast("Sign in required to edit your profile.", "info");
      return;
    }

    try {
      setIsSavingIdentity(true);
      await setDoc(
        doc(db, "users", user.uid),
        {
          displayName: nameDraft.trim() || user.displayName || "Reader",
          bio: bioDraft.trim(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      setIsIdentityModalOpen(false);
      showToast("Profile updated.", "success");
    } catch {
      showToast("Could not save profile right now.", "error");
    } finally {
      setIsSavingIdentity(false);
    }
  }

  async function saveImageBase64(base64: string, type: CropTarget) {
    if (!user) {
      showToast("Sign in required to upload images.", "info");
      return;
    }

    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          [type === "profile" ? "profileImageBase64" : "bannerImageBase64"]:
            base64,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      if (type === "profile") {
        setProfileImage(base64);
      } else {
        setBannerImage(base64);
      }
      showToast("Image saved to profile.", "success");
    } catch {
      showToast("Could not save image.", "error");
    }
  }

  async function startCrop(file: File, type: CropTarget) {
    try {
      const source = await fileToDataUrl(file);

      if (isGifFile(file)) {
        await saveImageBase64(source, type);
        showToast(
          "Animated GIF saved. Cropping is skipped to preserve animation.",
          "success",
        );
        return;
      }

      setCropTarget(type);
      setCropSource(source);
      setCropZoom(1);
      setCropPosition({ x: 0, y: 0 });
      setCroppedPixels(null);
    } catch {
      showToast("Could not open crop editor.", "error");
    }
  }

  async function saveCroppedImage() {
    if (!cropTarget || !cropSource || !croppedPixels) {
      showToast("Adjust crop and try again.", "info");
      return;
    }

    try {
      setIsSavingCrop(true);
      const croppedDataUrl = await getCroppedDataUrl(cropSource, croppedPixels);
      await saveImageBase64(croppedDataUrl, cropTarget);
      setCropTarget(null);
      setCropSource("");
      setCroppedPixels(null);
    } catch {
      showToast("Could not save cropped image.", "error");
    } finally {
      setIsSavingCrop(false);
    }
  }

  return (
    <>
      <section className="overflow-hidden rounded-2xl bg-card shadow-[0_5px_20px_rgb(0,0,0,0.06)]">
        <div className="relative h-40 bg-accent-soft">
          {bannerImage ? (
            <img
              src={bannerImage}
              alt="Profile banner"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm font-semibold text-muted">
              No banner set
            </div>
          )}
          {isEditMode ? (
            <label className="absolute right-3 top-3 inline-flex cursor-pointer items-center justify-center rounded-full border border-accent-soft bg-card p-2 text-accent shadow-[0_8px_18px_rgb(0,0,0,0.18)]">
              <PencilIcon />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void startCrop(file, "banner");
                  }
                }}
              />
            </label>
          ) : null}
        </div>

        <div className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-16 w-16 overflow-hidden rounded-full border border-accent-soft bg-accent-soft">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-muted">
                    IMG
                  </div>
                )}
                {isEditMode ? (
                  <label className="absolute left-1/2 top-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-accent-soft bg-card/80 p-1.5 text-accent opacity-70 shadow-[0_8px_18px_rgb(0,0,0,0.18)] transition hover:opacity-100">
                    <PencilIcon />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                          void startCrop(file, "profile");
                        }
                      }}
                    />
                  </label>
                ) : null}
              </div>
              <div className="relative pr-8">
                <p className="text-lg font-semibold">
                  {displayName}
                  {isEditMode ? (
                    <button
                      type="button"
                      onClick={() => setIsIdentityModalOpen(true)}
                      className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-accent-soft bg-card p-1 text-accent align-middle shadow-[0_8px_18px_rgb(0,0,0,0.18)]"
                      aria-label="Edit name and bio"
                      title="Edit name and bio"
                    >
                      <PencilIcon />
                    </button>
                  ) : null}
                </p>
                <p className="text-sm text-muted">{bio || "No bio yet."}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!user) {
                  showToast("Sign in required to edit your profile.", "info");
                  return;
                }
                setIsEditMode((current) => !current);
              }}
              className="rounded-full border border-accent px-4 py-2 text-xs font-semibold text-accent"
            >
              {isEditMode ? "Done Editing" : "Edit"}
            </button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  showToast("Sign in required to update reading goal.", "info");
                  return;
                }
                setGoalDraft(readingGoal);
                setIsGoalModalOpen(true);
              }}
              className="rounded-xl border border-accent-soft bg-accent-soft/30 p-4 text-left"
            >
              <p className="text-sm font-semibold text-muted">Reading Goal</p>
              <p className="mt-1 text-2xl font-bold text-accent">
                {readingGoal}
              </p>
              <p className="text-xs text-muted">Click to change</p>
            </button>

            <article className="rounded-xl border border-accent-soft bg-accent-soft/30 p-4">
              <p className="text-sm font-semibold text-muted">Completed</p>
              <p className="mt-1 text-2xl font-bold text-accent">
                {completedCount}
              </p>
              <p className="text-xs text-muted">Book from your shelf.</p>
            </article>
          </div>
        </div>
      </section>

      {isGoalModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-card p-5 shadow-[0_18px_40px_rgb(0,0,0,0.30)]">
            <h3 className="text-lg font-semibold">Update Reading Goal</h3>
            <p className="mt-1 text-sm text-muted">
              Choose your new annual goal.
            </p>

            <input
              type="number"
              min={1}
              max={300}
              value={goalDraft}
              onChange={(event) => setGoalDraft(Number(event.target.value))}
              className="mt-4 w-full rounded-xl border border-accent-soft bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
            />

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setIsGoalModalOpen(false)}
                className="w-full rounded-xl border border-accent-soft px-4 py-2 text-sm font-semibold text-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void saveGoal()}
                className="w-full rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white"
              >
                Save Goal
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isIdentityModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-md rounded-2xl bg-card p-5 shadow-[0_18px_40px_rgb(0,0,0,0.30)]">
            <h3 className="text-lg font-semibold">Edit Profile Details</h3>
            <p className="mt-1 text-sm text-muted">
              Update your display name and bio.
            </p>

            <label
              htmlFor="identity-name"
              className="mt-4 block text-xs font-semibold text-muted"
            >
              Display name
            </label>
            <input
              id="identity-name"
              type="text"
              value={nameDraft}
              onChange={(event) => setNameDraft(event.target.value)}
              className="mt-1 w-full rounded-xl border border-accent-soft bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
              placeholder="Reader Name"
            />

            <label
              htmlFor="identity-bio"
              className="mt-3 block text-xs font-semibold text-muted"
            >
              Bio
            </label>
            <textarea
              id="identity-bio"
              value={bioDraft}
              onChange={(event) => setBioDraft(event.target.value)}
              className="mt-1 h-24 w-full rounded-xl border border-accent-soft bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
              placeholder="What do you like to read?"
            />

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setIsIdentityModalOpen(false)}
                className="w-full rounded-xl border border-accent-soft px-4 py-2 text-sm font-semibold text-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void saveIdentity()}
                disabled={isSavingIdentity}
                className="w-full rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-55"
              >
                {isSavingIdentity ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {cropTarget ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-card p-5 shadow-[0_18px_40px_rgb(0,0,0,0.30)]">
            <h3 className="text-lg font-semibold">
              Crop {cropTarget === "profile" ? "Profile Photo" : "Banner Image"}
            </h3>
            <p className="mt-1 text-sm text-muted">
              Drag to position and use zoom for precise crop.
            </p>

            <div className="relative mt-4 h-72 overflow-hidden rounded-xl border border-accent-soft bg-black/40">
              <Cropper
                image={cropSource}
                crop={cropPosition}
                zoom={cropZoom}
                aspect={cropTarget === "profile" ? 1 : 3}
                onCropChange={setCropPosition}
                onZoomChange={setCropZoom}
                onCropComplete={(_, pixels) => setCroppedPixels(pixels)}
                showGrid={false}
              />
            </div>

            <div className="mt-4">
              <label className="text-xs font-semibold text-muted">Zoom</label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={cropZoom}
                onChange={(event) => setCropZoom(Number(event.target.value))}
                className="mt-2 w-full accent-[var(--accent)]"
              />
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setCropTarget(null);
                  setCropSource("");
                  setCroppedPixels(null);
                }}
                className="w-full rounded-xl border border-accent-soft px-4 py-2 text-sm font-semibold text-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void saveCroppedImage()}
                disabled={isSavingCrop}
                className="w-full rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-55"
              >
                {isSavingCrop ? "Saving..." : "Save Crop"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
