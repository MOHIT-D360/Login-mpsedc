import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, Eye, EyeOff, Fingerprint, KeyRound, LoaderCircle, RefreshCw, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authenticate, saveSession } from "@/lib/auth-service";
import { createCaptcha, matchesCaptcha } from "@/lib/captcha";

type FieldErrors = { identity?: string; password?: string; captcha?: string; form?: string };

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in | S3 Eternals" },
      { name: "description", content: "Secure sign-in for S3 Eternals team members." },
      { property: "og:title", content: "Sign in | S3 Eternals" },
      { property: "og:description", content: "Secure sign-in for S3 Eternals team members." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [captcha, setCaptcha] = useState("-----");
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [captchaEntry, setCaptchaEntry] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [shake, setShake] = useState(0);

  useEffect(() => setCaptcha(createCaptcha()), []);

  function refreshCaptcha() {
    setCaptcha(createCaptcha());
    setCaptchaEntry("");
    setErrors((previous) => ({ ...previous, captcha: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    const nextErrors: FieldErrors = {};
    const trimmedIdentity = identity.trim();
    if (!trimmedIdentity) {
      nextErrors.identity = "Username or email is required.";
    } else if (trimmedIdentity.includes("@") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedIdentity)) {
      nextErrors.identity = "Enter a valid email address.";
    }
    if (!password) nextErrors.password = "Password is required.";
    if (!captchaEntry.trim()) {
      nextErrors.captcha = "Please enter the CAPTCHA.";
    } else if (!matchesCaptcha(captcha, captchaEntry)) {
      nextErrors.captcha = "Invalid CAPTCHA. Please try again.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setShake((value) => value + 1);
      if (nextErrors.captcha) refreshCaptcha();
      return;
    }

    setLoading(true);
    try {
      const user = await authenticate(trimmedIdentity, password);
      saveSession(user);
      await navigate({ to: "/welcome" });
    } catch (error) {
      setErrors({
        form:
          error instanceof Error ? error.message : "Unable to sign in. Please try again.",
      });
      refreshCaptcha();
      setShake((value) => value + 1);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="auth-frame">
        <header className="flex items-center gap-3">
          <div className="brand-mark" aria-hidden="true">
            <Fingerprint className="size-6" strokeWidth={1.6} />
          </div>
          <div>
            <p className="font-display text-[1.15rem] font-semibold tracking-[0.01em] text-foreground">
              S3 <span className="text-primary">Eternals</span>
            </p>
            <p className="mt-0.5 text-[0.61rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Secure team access
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-accent shadow-[0_0_0.65rem_var(--accent)]" />
            <span>Systems ready</span>
          </div>
        </header>

        <section className={`auth-panel ${shake > 0 ? "error-shake" : ""}`} key={shake}>
          <div className="px-6 pb-7 pt-7 sm:px-8 sm:pb-8 sm:pt-8">
            <div className="mb-7">
              <div className="mb-5 flex size-10 items-center justify-center rounded-lg border border-border bg-secondary/80 text-primary">
                <KeyRound className="size-[1.15rem]" strokeWidth={1.7} />
              </div>
              <p className="mb-2 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-primary">
                Member sign-in
              </p>
              <h1 className="font-display text-[1.8rem] font-semibold leading-tight text-foreground">
                Welcome back.
              </h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Sign in to continue to your team workspace.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-[1.05rem]">
              <div>
                <label htmlFor="identity" className="mb-2 block text-[0.78rem] font-medium text-foreground/90">
                  Username / Email
                </label>
                <div className="field-shell flex items-center rounded-md border border-input bg-background/45 px-3 transition-all duration-200">
                  <UserRound className="mr-2.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="identity"
                    name="usernameOrEmail"
                    autoComplete="username"
                    placeholder="Enter your username or email"
                    value={identity}
                    onChange={(event) => setIdentity(event.target.value)}
                    aria-invalid={Boolean(errors.identity)}
                    aria-describedby={errors.identity ? "identity-error" : undefined}
                    disabled={loading}
                  />
                </div>
                {errors.identity && <p className="field-error mt-1.5 text-xs text-destructive" id="identity-error">{errors.identity}</p>}
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-[0.78rem] font-medium text-foreground/90">
                  Password
                </label>
                <div className="field-shell flex items-center rounded-md border border-input bg-background/45 px-3 transition-all duration-200">
                  <KeyRound className="mr-2.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? "password-error" : undefined}
                    disabled={loading}
                    className="pr-2"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
                {errors.password && <p className="field-error mt-1.5 text-xs text-destructive" id="password-error">{errors.password}</p>}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <label htmlFor="captcha-entry" className="text-[0.78rem] font-medium text-foreground/90">CAPTCHA</label>
                  <span className="text-[0.65rem] text-muted-foreground">Not case-sensitive</span>
                </div>
                <div className="flex items-stretch gap-2.5">
                  <div className="captcha-board flex min-h-[3.45rem] flex-1 items-center justify-center gap-2 rounded-md border border-border px-4" aria-label={`CAPTCHA: ${captcha}`}>
                    {captcha.split("").map((character, index) => (
                      <span className={`captcha-glyph-${index % 5} font-display text-[1.25rem] font-semibold tracking-[0.14em] text-foreground/90`} key={`${captcha}-${index}`}>
                        {character}
                      </span>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-[3.45rem] shrink-0 border-border bg-secondary/70 text-muted-foreground hover:text-primary"
                    onClick={refreshCaptcha}
                    aria-label="Refresh CAPTCHA"
                    title="Refresh CAPTCHA"
                  >
                    <RefreshCw className="size-4" />
                  </Button>
                </div>
                <div className="field-shell mt-2.5 flex items-center rounded-md border border-input bg-background/45 px-3 transition-all duration-200">
                  <Input
                    id="captcha-entry"
                    name="captcha"
                    autoComplete="off"
                    placeholder="Enter the characters above"
                    value={captchaEntry}
                    onChange={(event) => setCaptchaEntry(event.target.value)}
                    aria-invalid={Boolean(errors.captcha)}
                    aria-describedby={errors.captcha ? "captcha-error" : undefined}
                    disabled={loading}
                  />
                </div>
                {errors.captcha && <p className="field-error mt-1.5 text-xs text-destructive" id="captcha-error" role="alert">{errors.captcha}</p>}
              </div>

              {errors.form && (
                <p className="field-error rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2.5 text-sm text-destructive" role="alert">
                  {errors.form}
                </p>
              )}

              <Button type="submit" className="login-submit mt-1 h-12 w-full rounded-md text-[0.8rem] font-semibold uppercase tracking-[0.12em]" disabled={loading}>
                {loading ? (
                  <><LoaderCircle className="size-4 animate-spin" /> Authenticating...</>
                ) : (
                  <>Login <ArrowRight className="size-4" /></>
                )}
              </Button>
            </form>
          </div>

          <div className="flex items-center justify-between border-t border-border/70 bg-background/15 px-6 py-3.5 text-[0.62rem] uppercase tracking-[0.1em] text-muted-foreground sm:px-8">
            <span>Encrypted connection</span>
            <span className="flex items-center gap-1.5"><span className="size-1 rounded-full bg-accent" /> Members only</span>
          </div>
        </section>

        <footer className="mt-5 flex items-center justify-center gap-2 text-[0.65rem] text-muted-foreground/80">
          <span className="size-1 rounded-full bg-primary/70" />
          <span>S3 Eternals</span>
          <span aria-hidden="true">·</span>
          <span>Secure identity gateway</span>
        </footer>
      </div>
    </main>
  );
}