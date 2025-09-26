export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <div className="max-w-2xl space-y-6 p-8 text-center">
        <h1 className="text-3xl font-semibold sm:text-4xl">Welcome to AESTrak</h1>
        <p className="text-base text-foreground/80">
          The core application scaffolding is in place. Start building the authentication flow under
          <code className="mx-2 rounded bg-foreground/10 px-1 py-0.5 font-mono text-sm">
            src/features/auth
          </code>
          and wire Supabase data access through the helpers in
          <code className="mx-2 rounded bg-foreground/10 px-1 py-0.5 font-mono text-sm">
            src/libs/supabase
          </code>
          .
        </p>
      </div>
    </main>
  );
}
