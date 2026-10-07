import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { ArrowRightFromLine, BadgeCheck, Fingerprint } from "lucide-react";

import { Button } from "@/components/ui/button";
import { clearSession, readSession } from "@/lib/auth-service";

export const Route = createFileRoute("/welcome")({
  ssr: false,
  beforeLoad: () => {
    if (!readSession()) throw redirect({ to: "/login" });
  },
  head: () => ({
    meta: [
      { title: "Welcome | S3 Eternals" },
      { name: "description", content: "Your secure S3 Eternals team session is active." },
      { property: "og:title", content: "Welcome | S3 Eternals" },
      { property: "og:description", content: "Your secure S3 Eternals team session is active." },
    ],
  }),
  component: WelcomePage,
});

function WelcomePage() {
  const user = readSession();
  const navigate = useNavigate();

  if (!user) return null;

  async function handleLogout() {
    clearSession();
    await navigate({ to: "/login" });
  }

  return (
    <main className="auth-shell flex min-h-svh items-center justify-center px-4 py-8 sm:py-12">
      <div className="auth-frame">
        <header className="flex items-center gap-3">
          <div className="brand-mark" aria-hidden="true"><Fingerprint className="size-6" strokeWidth={1.6} /></div>
          <div>
            <p className="font-display text-[1.15rem] font-semibold tracking-[0.01em] text-foreground">S3 <span className="text-primary">Eternals</span></p>
            <p className="mt-0.5 text-[0.61rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">Secure team access</p>
          </div>
        </header>

        <section className="auth-panel mt-8 px-6 py-8 text-center sm:px-9 sm:py-10">
          <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-full border border-accent/35 bg-accent/10 text-accent">
            <BadgeCheck className="size-6" strokeWidth={1.7} />
          </div>
          <p className="mb-2 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-accent">Access confirmed</p>
          <h1 className="font-display text-[1.8rem] font-semibold leading-tight text-foreground">Welcome, {user.username}.</h1>
          <p className="mx-auto mt-3 max-w-[22rem] text-sm leading-6 text-muted-foreground">
            You have successfully logged in to S3 Eternals.
          </p>
          <Button onClick={handleLogout} variant="outline" className="mt-8 h-11 w-full border-border bg-secondary/60 text-foreground hover:bg-secondary">
            <ArrowRightFromLine className="size-4" /> Log out
          </Button>
        </section>

        <footer className="mt-5 flex items-center justify-center gap-2 text-[0.65rem] text-muted-foreground/80">
          <span className="size-1 rounded-full bg-accent" />
          <span>Session active</span>
          <span aria-hidden="true">·</span>
          <span>S3 Eternals</span>
        </footer>
      </div>
    </main>
  );
}