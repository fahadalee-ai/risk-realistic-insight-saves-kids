import { useEffect, useRef, useState } from "react";
import { content } from "../data/content.js";
import { images } from "../data/images";
import { passwordStrength, validEmail, digits } from "../lib/format";
import { useApp } from "../lib/store";
import { useGo } from "../lib/nav";
import { Button, Checkbox, Chip, Input, Logo, ScreenContainer, Sheet } from "../components/ios";

const ui = content.ui;

function takeReturn() {
  const value = sessionStorage.getItem("risk-return");
  sessionStorage.removeItem("risk-return");
  return value;
}

export function SplashScreen() {
  const { ready, state } = useApp();
  const { replace } = useGo();
  useEffect(() => {
    if (!ready) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => {
      if (!state.seenOnboarding) replace("/onboarding");
      else if (state.session.status === "out") replace("/login");
      else replace("/home");
    }, reduced ? 400 : 2500);
    return () => window.clearTimeout(timer);
  }, [ready, state.seenOnboarding, state.session.status, replace]);

  return (
    <div className="rk-splash">
      <div className="rk-logo-wrap">
        <span className="rk-ring" />
        <Logo size={160} />
      </div>
      <div className="rk-fade">
        <h1 className="rk-h3" style={{ color: "var(--primary-text)" }}>
          {content.brand.tagline}
        </h1>
        <div className="rk-dotpulse" style={{ marginTop: 16 }} aria-hidden>
          <i />
          <i />
          <i />
        </div>
      </div>
    </div>
  );
}

export function OnboardingScreen() {
  const { setSeenOnboarding } = useApp();
  const { replace } = useGo();
  const [page, setPage] = useState(0);
  const start = useRef(0);
  const slide = content.onboarding[page];
  const finish = (to: string) => {
    setSeenOnboarding();
    replace(to);
  };

  return (
    <div
      className="rk-onboard"
      onPointerDown={(event) => {
        start.current = event.clientX;
      }}
      onPointerUp={(event) => {
        const dx = event.clientX - start.current;
        if (dx < -50) setPage((value) => Math.min(2, value + 1));
        if (dx > 50) setPage((value) => Math.max(0, value - 1));
      }}
    >
      <img
        src={images[slide.image as keyof typeof images]}
        alt=""
        style={{ position: "absolute", inset: 0, width: "100%", height: "62%", objectFit: "cover" }}
      />
      {page < 2 && (
        <button type="button" className="rk-link" style={{ position: "absolute", top: "var(--safe-t)", right: 16, color: "#fff", background: "rgba(0,0,0,0.45)", borderRadius: 999, padding: "0 12px" }} onClick={() => finish("/login")}>
          {ui.skip}
        </button>
      )}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          top: "52%",
          background: "var(--bg)",
          borderRadius: "28px 28px 0 0",
          padding: "24px 16px calc(16px + var(--safe-b))",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <h1 className="rk-h1">{slide.title}</h1>
        <p className="rk-body rk-secondary rk-copy">{slide.text}</p>
        <div className="rk-dots" aria-hidden>
          {content.onboarding.map((item, index) => (
            <i key={item.title} className={index === page ? "on" : ""} />
          ))}
        </div>
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
          {page < 2 ? (
            <Button onClick={() => setPage((value) => value + 1)}>{ui.next}</Button>
          ) : (
            <>
              <Button onClick={() => finish("/register")}>{ui.getStarted}</Button>
              <Button variant="ghost" onClick={() => finish("/login")}>
                {ui.haveAccount}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function LoginScreen() {
  const { signIn, signInProvider, continueGuest, setSeenOnboarding } = useApp();
  const { go, replace } = useGo();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  const submit = () => {
    const next: typeof errors = {};
    if (!validEmail(email)) next.email = ui.emailInvalid;
    if (password.length < 8) next.password = ui.passwordShort;
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    window.setTimeout(() => {
      const message = signIn(email, password);
      setLoading(false);
      if (message) setErrors({ form: message });
      else if (takeReturn() === "review") replace("/book", { step: 5 });
      else replace("/home");
    }, 400);
  };

  return (
    <ScreenContainer mode="none">
      <div className="rk-auth-banner">
        <img className="bg" src={images.auth} alt="" />
        <img className="logo" src={images.logo} alt={content.brand.title} />
      </div>
      <div className="rk-pad rk-stack" style={{ paddingTop: 24, paddingBottom: 32 }}>
        <div>
          <h1 className="rk-h1">{ui.welcomeBack}</h1>
          <p className="rk-sub">{ui.signInSubtitle}</p>
        </div>
        <Input label={ui.email} value={email} onChange={setEmail} inputMode="email" autoComplete="email" error={errors.email} />
        <Input label={ui.password} type="password" value={password} onChange={setPassword} autoComplete="current-password" error={errors.password} />
        <div style={{ textAlign: "right" }}>
          <button type="button" className="rk-link" onClick={() => go("/forgot", { step: 1 })}>
            {ui.forgot}
          </button>
        </div>
        {errors.form && <p className="rk-error">{errors.form}</p>}
        <Button onClick={submit} loading={loading}>
          {ui.signIn}
        </Button>
        <div className="rk-divider">{ui.or}</div>
        <Button
          variant="apple"
          onClick={() => {
            signInProvider("apple");
            replace("/home");
          }}
        >
          {ui.apple}
        </Button>
        <Button
          variant="google"
          onClick={() => {
            signInProvider("google");
            replace("/home");
          }}
        >
          {ui.google}
        </Button>
        <p className="rk-body" style={{ textAlign: "center" }}>
          {ui.new}{" "}
          <button type="button" className="rk-link" onClick={() => go("/register")}>
            {ui.create}
          </button>
        </p>
        <Button
          variant="ghost"
          onClick={() => {
            setSeenOnboarding();
            continueGuest();
            replace("/home");
          }}
        >
          {ui.guest}
        </Button>
      </div>
    </ScreenContainer>
  );
}

export function RegisterScreen() {
  const { beginRegister } = useApp();
  const { go } = useGo();
  const [form, setForm] = useState({
    first: "",
    last: "",
    email: "",
    phone: "",
    countryId: "us",
    password: "",
    confirm: "",
    role: content.roles[0],
    agree: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [codes, setCodes] = useState(false);
  const [legal, setLegal] = useState<"terms" | "privacy" | null>(null);
  const country = content.countries.find((item) => item.id === form.countryId)!;
  const strength = passwordStrength(form.password);
  const set = (key: string, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));

  const submit = () => {
    const next: Record<string, string> = {};
    if (!form.first.trim() || !form.last.trim()) next.name = ui.required;
    if (!validEmail(form.email)) next.email = ui.emailInvalid;
    if (digits(form.phone).length < 7) next.phone = ui.phoneInvalid;
    if (form.password.length < 8) next.password = ui.passwordShort;
    if (form.password !== form.confirm) next.confirm = ui.passwordMismatch;
    if (!form.agree) next.agree = ui.termsRequired;
    setErrors(next);
    if (Object.keys(next).length) return;
    const message = beginRegister({
      firstName: form.first.trim(),
      lastName: form.last.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      countryId: form.countryId,
      password: form.password,
      role: form.role,
    });
    if (message) setErrors({ email: message });
    else go("/verify");
  };

  return (
    <ScreenContainer mode="inline" title={ui.createTitle} fallback="/login">
      <div className="rk-pad rk-stack" style={{ paddingTop: 16 }}>
        <Input label={ui.fullName} value={`${form.first}${form.last ? " " + form.last : ""}`} onChange={(value) => {
          const [first, ...rest] = value.split(" ");
          setForm((current) => ({ ...current, first, last: rest.join(" ") }));
        }} autoComplete="name" error={errors.name} />
        <Input label={ui.email} value={form.email} onChange={(value) => set("email", value)} inputMode="email" autoComplete="email" error={errors.email} />
        <div className="rk-field">
          <span className="rk-label">{ui.phone}</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="rk-chip" onClick={() => setCodes(true)}>
              {country.code}
            </button>
            <input className="rk-input" style={{ paddingRight: 16 }} inputMode="tel" autoComplete="tel" value={form.phone} onChange={(event) => set("phone", event.target.value)} />
          </div>
          {errors.phone && <span className="rk-error">{errors.phone}</span>}
        </div>
        <Input label={ui.password} type="password" value={form.password} onChange={(value) => set("password", value)} autoComplete="new-password" error={errors.password} />
        {form.password && (
          <div>
            <div className="rk-meter" aria-hidden>
              <span style={{ width: `${strength.level * 33}%` }} />
            </div>
            <p className="rk-help">{strength.label}</p>
          </div>
        )}
        <Input label={ui.confirmPassword} type="password" value={form.confirm} onChange={(value) => set("confirm", value)} error={errors.confirm} />
        <div>
          <p className="rk-label" style={{ marginBottom: 8 }}>{ui.iAm}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {content.roles.map((role) => (
              <Chip key={role} selected={form.role === role} onClick={() => set("role", role)}>
                {role}
              </Chip>
            ))}
          </div>
        </div>
        <Checkbox checked={form.agree} onChange={(value) => set("agree", value)}>
          I agree to the{" "}
          <button type="button" className="rk-link" onClick={(event) => { event.stopPropagation(); setLegal("terms"); }}>
            Terms of Service
          </button>{" "}
          and{" "}
          <button type="button" className="rk-link" onClick={(event) => { event.stopPropagation(); setLegal("privacy"); }}>
            Privacy Policy
          </button>
        </Checkbox>
        {errors.agree && <p className="rk-error">{errors.agree}</p>}
        <Button onClick={submit}>{ui.createAccount}</Button>
        <p className="rk-body" style={{ textAlign: "center" }}>
          {ui.already}{" "}
          <button type="button" className="rk-link" onClick={() => go("/login")}>
            {ui.signInLink}
          </button>
        </p>
      </div>
      <Sheet open={codes} onClose={() => setCodes(false)} title={ui.phone}>
        {content.countries.map((item) => (
          <button key={item.id} type="button" className="rk-row rk-press" onClick={() => { set("countryId", item.id); setCodes(false); }}>
            <span className="rk-row-title">{item.label}</span>
            <span className="rk-secondary">{item.code}</span>
          </button>
        ))}
      </Sheet>
      <Sheet open={legal !== null} onClose={() => setLegal(null)} title={legal === "privacy" ? ui.privacy : ui.terms}>
        <div className="rk-copy rk-stack">
          {(legal === "privacy" ? content.legal.privacy : content.legal.terms).map((paragraph) => (
            <p key={paragraph.slice(0, 24)} className="rk-body">{paragraph}</p>
          ))}
        </div>
      </Sheet>
    </ScreenContainer>
  );
}

export function VerifyScreen() {
  const { completeVerify, state } = useApp();
  const { replace } = useGo();
  const [digitsCode, setDigits] = useState(["", "", "", "", "", ""]);
  const [seconds, setSeconds] = useState(30);
  const [done, setDone] = useState(false);
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = window.setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [seconds]);

  const submit = (code = digitsCode.join("")) => {
    if (code.length < 6) return;
    completeVerify();
    setDone(true);
  };

  return (
    <ScreenContainer mode="inline" title={ui.verifyTitle} fallback="/register">
      <div className="rk-pad rk-stack" style={{ paddingTop: 16 }}>
        <p className="rk-body rk-secondary">{ui.verifyText}</p>
        <p className="rk-help">{state.pendingUser?.email}</p>
        <div className="rk-otp">
          {digitsCode.map((digit, index) => (
            <input
              key={index}
              ref={(node) => { refs.current[index] = node; }}
              inputMode="numeric"
              maxLength={1}
              value={digit}
              aria-label={`Digit ${index + 1}`}
              onChange={(event) => {
                const value = event.target.value.replace(/\D/g, "").slice(-1);
                const next = [...digitsCode];
                next[index] = value;
                setDigits(next);
                if (value && refs.current[index + 1]) refs.current[index + 1]?.focus();
                if (next.join("").length === 6) submit(next.join(""));
              }}
              onKeyDown={(event) => {
                if (event.key === "Backspace" && !digitsCode[index] && refs.current[index - 1]) refs.current[index - 1]?.focus();
              }}
              onPaste={(event) => {
                const paste = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                if (!paste) return;
                event.preventDefault();
                const next = paste.split("");
                while (next.length < 6) next.push("");
                setDigits(next);
                if (paste.length === 6) submit(paste);
              }}
            />
          ))}
        </div>
        <p className="rk-help">{ui.demoCode}</p>
        <button type="button" className="rk-link" disabled={seconds > 0} onClick={() => setSeconds(30)}>
          {seconds > 0 ? `${ui.resend} 00:${String(seconds).padStart(2, "0")}` : ui.resend}
        </button>
        <Button onClick={() => submit()} disabled={digitsCode.join("").length < 6}>
          {ui.verify}
        </Button>
      </div>
      <Sheet open={done} onClose={() => {}} title={ui.accountReady}>
        <div className="rk-success-mark" aria-hidden>
          <svg width="42" height="42" viewBox="0 0 42 42">
            <circle cx="21" cy="21" r="18" fill="none" stroke="var(--primary)" strokeWidth="3" />
            <path d="M12 22 l6 6 12-14" fill="none" stroke="var(--primary)" strokeWidth="3" />
          </svg>
        </div>
        <p className="rk-body rk-secondary" style={{ textAlign: "center", margin: "16px 0" }}>{ui.accountReadyText}</p>
        <Button
          onClick={() => {
            if (takeReturn() === "review") replace("/book", { step: 5 });
            else replace("/home");
          }}
        >
          {ui.backHome}
        </Button>
      </Sheet>
    </ScreenContainer>
  );
}

export function ForgotScreen({ step }: { step: number }) {
  const { resetPassword, state } = useApp();
  const { go, replace } = useGo();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  return (
    <ScreenContainer mode="inline" title={ui.forgotTitle} fallback="/login">
      <div className="rk-pad rk-stack" style={{ paddingTop: 16 }}>
        {step === 1 && (
          <>
            <p className="rk-body rk-secondary">{ui.forgotText}</p>
            <Input label={ui.email} value={email} onChange={setEmail} inputMode="email" error={error} />
            <Button
              onClick={() => {
                if (!validEmail(email)) return setError(ui.emailInvalid);
                if (!state.users.some((user) => user.email.toLowerCase() === email.toLowerCase())) return setError(ui.noAccount);
                sessionStorage.setItem("risk-reset-email", email);
                go("/forgot", { step: 2 });
              }}
            >
              {ui.sendCode}
            </Button>
          </>
        )}
        {step === 2 && (
          <>
            <p className="rk-body rk-secondary">{ui.verifyText}</p>
            <p className="rk-help">{ui.demoCode}</p>
            <div className="rk-otp">
              {code.map((digit, index) => (
                <input
                  key={index}
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  aria-label={`Digit ${index + 1}`}
                  onChange={(event) => {
                    const next = [...code];
                    next[index] = event.target.value.replace(/\D/g, "").slice(-1);
                    setCode(next);
                  }}
                />
              ))}
            </div>
            <Button disabled={code.join("").length < 6} onClick={() => go("/forgot", { step: 3 })}>
              {ui.continue}
            </Button>
          </>
        )}
        {step === 3 && (
          <>
            <Input label={ui.newPassword} type="password" value={password} onChange={setPassword} />
            <Input label={ui.confirmPassword} type="password" value={confirm} onChange={setConfirm} error={error} />
            <Button
              onClick={() => {
                if (password.length < 8) return setError(ui.passwordShort);
                if (password !== confirm) return setError(ui.passwordMismatch);
                const saved = sessionStorage.getItem("risk-reset-email") || email;
                const message = resetPassword(saved, password);
                if (message) return setError(message);
                setDone(true);
              }}
            >
              {ui.reset}
            </Button>
          </>
        )}
      </div>
      <Sheet open={done} onClose={() => replace("/login")} title={ui.resetDone}>
        <p className="rk-body rk-secondary" style={{ marginBottom: 16 }}>{ui.resetDoneText}</p>
        <Button onClick={() => replace("/login")}>{ui.signIn}</Button>
      </Sheet>
    </ScreenContainer>
  );
}
