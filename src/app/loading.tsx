export default function Loading() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center p-6 md:p-10">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-accent-soft bg-card px-8 py-7 shadow-[0_8px_30px_rgb(0,0,0,0.07)]">
          <span className="loading loading-spinner loading-lg text-accent" />
          <p className="text-sm font-semibold text-muted">Loading...</p>
        </div>
      </div>
    </main>
  );
}
