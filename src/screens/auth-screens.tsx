import { useEffect, useRef, useState } from "react";
import { content } from "../data/content.js";
import { images } from "../data/images";
import { useApp } from "../lib/store";
import { useGo } from "../lib/nav";
import { Button, Checkbox, Chip, Input, ScreenContainer, Sheet } from "../components/ios";

const ui = content.ui;

function takeReturn() {
  const value = sessionStorage.getItem("risk-return");
  sessionStorage.removeItem("risk-return");
  return value;
}

export function SplashScreen() {
  const { ready } = useApp();
  const { replace } = useGo();
  useEffect(() => {
    if (!ready) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => {
      replace("/onboarding");
    }, reduced ? 400 : 2500);
    return () => window.clearTimeout(timer);
  }, [ready, replace]);

  return (
    <div className="rk-splash">
      <div className="rk-logo-wrap">
        <span className="rk-ring" />
        <p className="rk-wordmark">{content.brand.name}</p>
      </div>
      <div className="rk-fade">
        <h1 className="rk-splash-tag">{content.brand.tagline}</h1>
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
      <img className="rk-onboard-photo" src={images[slide.image as keyof typeof images]} alt="" />
      <div className="rk-onboard-scrim" />
      {page < 2 && (
        <button type="button" className="rk-link rk-onboard-skip" onClick={() => finish("/login")}>
          {ui.skip}
        </button>
      )}
      <div className="rk-onboard-copy">
        <h1>{slide.title}</h1>
        <p className="rk-copy">{slide.text}</p>
        <div className="rk-dots on-dark" aria-hidden>
          {content.onboarding.map((item, index) => (
            <i key={item.title} className={index === page ? "on" : ""} />
          ))}
        </div>
        <div className="rk-onboard-actions">
          {page < 2 ? (
            <Button onClick={() => setPage((value) => value + 1)}>{ui.next}</Button>
          ) : (
            <>
              <Button onClick={() => finish("/login")}>{ui.getStarted}</Button>
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
  const [loading, setLoading] = useState(false);

  const submit = () => {
    setLoading(true);
    window.setTimeout(() => {
      const message = signIn(email, password);
      setLoading(false);
      if (message) continueGuest();
      if (takeReturn() === "review") replace("/book", { step: 5 });
      else replace("/home");
    }, 400);
  };

  return (
    <ScreenContainer mode="none">
      <div className="rk-auth">
        <header className="rk-auth-head">
          <p className="rk-wordmark sm">{content.brand.name}</p>
          <h1>{ui.welcomeBack}</h1>
          <p>{ui.signInSubtitle}</p>
        </header>
        <div className="rk-auth-card">
        <Input label={ui.email} value={email} onChange={setEmail} inputMode="email" autoComplete="email" />
        <Input label={ui.password} type="password" value={password} onChange={setPassword} autoComplete="current-password" />
        <div style={{ textAlign: "right" }}>
          <button type="button" className="rk-link" onClick={() => go("/forgot", { step: 1 })}>
            {ui.forgot}
          </button>
        </div>
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
        </div>
        <p className="rk-auth-foot">
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
  const [codes, setCodes] = useState(false);
  const [legal, setLegal] = useState<"terms" | "privacy" | null>(null);
  const country = content.countries.find((item) => item.id === form.countryId)!;
  const set = (key: string, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));

  const submit = () => {
    beginRegister({
      firstName: form.first.trim() || "Guest",
      lastName: form.last.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      countryId: form.countryId,
      password: form.password,
      role: form.role,
    });
    go("/verify");
  };

  return (
    <ScreenContainer mode="inline" title={ui.createTitle} fallback="/login" explicitBack>
      <div className="rk-pad rk-auth-form">
        <p className="rk-wordmark sm">{content.brand.name}</p>
        <Input label={ui.fullName} value={`${form.first}${form.last ? " " + form.last : ""}`} onChange={(value) => {
          const [first, ...rest] = value.split(" ");
          setForm((current) => ({ ...current, first, last: rest.join(" ") }));
        }} autoComplete="name" />
        <Input label={ui.email} value={form.email} onChange={(value) => set("email", value)} inputMode="email" autoComplete="email" />
        <div className="rk-field">
          <span className="rk-label">{ui.phone}</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="rk-chip" onClick={() => setCodes(true)}>
              {country.code}
            </button>
            <input className="rk-input" style={{ paddingRight: 16 }} inputMode="tel" autoComplete="tel" value={form.phone} onChange={(event) => set("phone", event.target.value)} />
          </div>
        </div>
        <Input label={ui.password} type="password" value={form.password} onChange={(value) => set("password", value)} autoComplete="new-password" />
        <Input label={ui.confirmPassword} type="password" value={form.confirm} onChange={(value) => set("confirm", value)} />
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
        <Button onClick={submit}>{ui.createAccount}</Button>
        <p className="rk-auth-foot">
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
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = window.setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [seconds]);

  const submit = () => {
    completeVerify();
    if (takeReturn() === "review") replace("/book", { step: 5 });
    else replace("/home");
  };

  return (
    <ScreenContainer mode="inline" title={ui.verifyTitle} fallback="/register" explicitBack>
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
                if (next.join("").length === 6) submit();
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
                if (paste.length === 6) submit();
              }}
            />
          ))}
        </div>
        <p className="rk-help">{ui.demoCode}</p>
        <button type="button" className="rk-link" disabled={seconds > 0} onClick={() => setSeconds(30)}>
          {seconds > 0 ? `${ui.resend} 00:${String(seconds).padStart(2, "0")}` : ui.resend}
        </button>
        <Button onClick={() => submit()}>
          {ui.verify}
        </Button>
      </div>
    </ScreenContainer>
  );
}

export function ForgotScreen({ step }: { step: number }) {
  const { resetPassword } = useApp();
  const { go, replace } = useGo();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);

  return (
    <ScreenContainer mode="inline" title={ui.forgotTitle} fallback="/login" explicitBack>
      <div className="rk-pad rk-stack" style={{ paddingTop: 16 }}>
        {step === 1 && (
          <>
            <p className="rk-body rk-secondary">{ui.forgotText}</p>
            <Input label={ui.email} value={email} onChange={setEmail} inputMode="email" />
            <Button
              onClick={() => {
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
            <Button onClick={() => go("/forgot", { step: 3 })}>
              {ui.continue}
            </Button>
          </>
        )}
        {step === 3 && (
          <>
            <Input label={ui.newPassword} type="password" value={password} onChange={setPassword} />
            <Input label={ui.confirmPassword} type="password" value={confirm} onChange={setConfirm} />
            <Button
              onClick={() => {
                const saved = sessionStorage.getItem("risk-reset-email") || email;
                resetPassword(saved, password);
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
