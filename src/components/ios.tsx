import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  Bell,
  BookOpen,
  CalendarPlus,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Home,
  LayoutGrid,
  UserRound,
  X,
} from "lucide-react";
import { content } from "../data/content.js";
import { images, type ImageKey } from "../data/images";
import { dateAvailable, slotAvailable, timeSlots, toIso, todayIso, periods } from "../data/slots.js";
import { useApp } from "../lib/store";
import { useRouterState } from "@tanstack/react-router";
import { isTab, useGo } from "../lib/nav";

const ui = content.ui;

export function Photo({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`rk-photo ${className}`}>
      {!loaded && <div className="ph" />}
      <img src={src} alt={alt} loading="lazy" className={loaded ? "in" : ""} onLoad={() => setLoaded(true)} />
    </div>
  );
}

export function Logo({ size = 96 }: { size?: number }) {
  return <img src={images.logo} alt={content.brand.title} width={size} height={size} style={{ width: size, height: "auto" }} />;
}

export function Avatar({
  name,
  src,
  size = 56,
}: {
  name: string;
  src?: string;
  size?: number;
}) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span className="rk-avatar" style={{ width: size, height: size, fontSize: size < 40 ? 12 : 17 }} aria-hidden={src ? undefined : true}>
      {src ? <img src={src} alt="" /> : initials || "R"}
    </span>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  type = "button",
  disabled,
  loading,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "apple" | "google" | "destructive";
  type?: "button" | "submit";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}) {
  return (
    <button type={type} className={`rk-btn ${variant} ${className}`} onClick={onClick} disabled={disabled || loading}>
      {loading ? <i className="rk-spin light" aria-hidden /> : children}
    </button>
  );
}

export function Input({
  label,
  value,
  onChange,
  type = "text",
  inputMode,
  placeholder,
  error,
  autoComplete,
  maxLength,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  inputMode?: "text" | "email" | "tel" | "numeric";
  placeholder?: string;
  error?: string;
  autoComplete?: string;
  maxLength?: number;
  multiline?: boolean;
}) {
  const [show, setShow] = useState(false);
  const id = useId();
  const password = type === "password";
  return (
    <label className="rk-field rk-kbd-pad" htmlFor={id}>
      <span className="rk-label">{label}</span>
      <span className="rk-input-wrap">
        {multiline ? (
          <textarea
            id={id}
            className={`rk-area ${error ? "bad" : ""}`}
            value={value}
            maxLength={maxLength}
            placeholder={placeholder}
            onChange={(event) => onChange(event.target.value)}
          />
        ) : (
          <input
            id={id}
            className={`rk-input ${error ? "bad" : ""}`}
            value={value}
            type={password && show ? "text" : type}
            inputMode={inputMode}
            autoComplete={autoComplete}
            placeholder={placeholder}
            maxLength={maxLength}
            onChange={(event) => onChange(event.target.value)}
          />
        )}
        {!multiline && value && !password && (
          <button type="button" className="rk-clear" aria-label="Clear" onClick={() => onChange("")}>
            <X size={18} />
          </button>
        )}
        {password && (
          <button type="button" className="rk-eye" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow((v) => !v)}>
            {show ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </span>
      {error && <span className="rk-error">{error}</span>}
    </label>
  );
}

export function SegmentedControl({
  value,
  options,
  onChange,
  label,
}: {
  value: string;
  options: { id: string; label: string }[];
  onChange: (id: string) => void;
  label: string;
}) {
  return (
    <div className="rk-seg" role="tablist" aria-label={label}>
      {options.map((option) => (
        <button key={option.id} type="button" role="tab" aria-selected={value === option.id} className={value === option.id ? "on" : ""} onClick={() => onChange(option.id)}>
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className={`rk-switch ${checked ? "on" : ""}`} onClick={() => onChange(!checked)}>
      <i />
    </button>
  );
}

export function Checkbox({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  children: ReactNode;
}) {
  return (
    <div className="rk-check">
      <button type="button" className="rk-icon" aria-pressed={checked} onClick={() => onChange(!checked)} aria-label="Agree">
        <span className={`rk-box ${checked ? "on" : ""}`}>{checked && <Check size={16} />}</span>
      </button>
      <span>{children}</span>
    </div>
  );
}

export function Chip({
  selected,
  onClick,
  children,
  disabled,
}: {
  selected?: boolean;
  onClick?: () => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button type="button" className={`rk-chip ${selected ? "on" : ""}`} onClick={onClick} disabled={disabled} aria-pressed={selected}>
      {children}
    </button>
  );
}

export function Stepper({
  value,
  min = 1,
  max = 500,
  onChange,
  label,
}: {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  label: string;
}) {
  return (
    <div className="rk-stepper" aria-label={label}>
      <button type="button" aria-label="Decrease" onClick={() => onChange(Math.max(min, value - 1))}>–</button>
      <strong>{value}</strong>
      <button type="button" aria-label="Increase" onClick={() => onChange(Math.min(max, value + 1))}>+</button>
    </div>
  );
}

export function ProgressStepper({ step, total = 5 }: { step: number; total?: number }) {
  return (
    <div>
      <p className="rk-pad rk-secondary" style={{ fontSize: 13, marginBottom: 8 }}>
        {ui.stepOf} {Math.min(step, total)} of {total}
      </p>
      <div className="rk-progress" aria-hidden>
        <span style={{ width: `${(Math.min(step, total) / total) * 100}%` }} />
      </div>
    </div>
  );
}

export function FlowStepper() {
  return (
    <div className="rk-flow">
      {content.howItWorks.map((item, index) => (
        <article key={item.title}>
          <b>0{index + 1}</b>
          <strong>{item.title}</strong>
          <p>{item.text}</p>
        </article>
      ))}
    </div>
  );
}

export function Card({
  children,
  onClick,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  if (onClick) {
    return (
      <button type="button" className={`rk-card rk-press ${className}`} onClick={onClick}>
        {children}
      </button>
    );
  }
  return <div className={`rk-card ${className}`}>{children}</div>;
}

export function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="rk-section">
      <h2>{title}</h2>
      {action && (
        <button type="button" onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  );
}

export function InsetGroupedList({ children }: { children: ReactNode }) {
  return <div className="rk-group">{children}</div>;
}

export function ListItem({
  title,
  subtitle,
  leading,
  trailing,
  onPress,
  chevron,
  destructive,
}: {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  onPress?: () => void;
  chevron?: boolean;
  destructive?: boolean;
}) {
  const Comp = onPress ? "button" : "div";
  return (
    <Comp className={`rk-row rk-press ${destructive ? "danger" : ""}`} onClick={onPress} type={onPress ? "button" : undefined}>
      {leading}
      <span className="rk-row-text">
        <span className="rk-row-title">{title}</span>
        {subtitle && <span className="rk-row-sub">{subtitle}</span>}
      </span>
      {trailing}
      {chevron && <ChevronRight size={18} color="var(--tertiary)" />}
    </Comp>
  );
}

export function BackButton({
  label = ui.back,
  fallback = "/home",
  explicit = false,
}: {
  label?: string;
  fallback?: string;
  explicit?: boolean;
}) {
  const { back, canGoBack, replace } = useGo();
  if (!canGoBack && !explicit) return <span style={{ minWidth: 44 }} />;
  return (
    <button
      type="button"
      className="rk-back rk-press"
      onClick={() => (explicit ? replace(fallback) : back(fallback))}
      aria-label={label}
    >
      <ChevronLeft size={22} />
      <span>{label}</span>
    </button>
  );
}

export function AppHeader({
  title,
  right,
  scrolled,
  fallback,
  explicitBack = false,
}: {
  title?: string;
  right?: ReactNode;
  scrolled?: boolean;
  fallback?: string;
  explicitBack?: boolean;
}) {
  return (
    <header className={`rk-header ${scrolled ? "solid hairline" : "solid"}`}>
      <div className="rk-bar">
        <div className="rk-bar-side">
          <BackButton fallback={fallback} explicit={explicitBack} />
        </div>
        <div className="rk-bar-title">{title}</div>
        <div className="rk-bar-side right">{right}</div>
      </div>
    </header>
  );
}

export function LargeTitleHeader({
  title,
  right,
  scrolled,
}: {
  title: string;
  right?: ReactNode;
  scrolled?: boolean;
}) {
  if (!scrolled && !right) return null;
  return (
    <header className={`rk-header solid ${scrolled ? "hairline" : ""}`}>
      <div className="rk-bar">
        <div className="rk-bar-side" />
        <div className="rk-bar-title" style={{ opacity: scrolled ? 1 : 0 }}>{title}</div>
        <div className="rk-bar-side right">{right}</div>
      </div>
    </header>
  );
}

export function BottomTabBar() {
  const { pathname, go } = useGo();
  const { state, ownerId } = useApp();
  const unread = state.notices.filter((item) => item.userId === ownerId && !item.read).length;
  const tabs = [
    { id: "/home", label: ui.tabs.home, icon: Home },
    { id: "/services", label: ui.tabs.services, icon: LayoutGrid },
    { id: "/book", label: ui.tabs.book, icon: CalendarPlus, center: true },
    { id: "/resources", label: ui.tabs.resources, icon: BookOpen },
    { id: "/profile", label: ui.tabs.profile, icon: UserRound },
  ];
  return (
    <nav className="rk-tabbar" aria-label="Tabs">
      {tabs.map((tab) => {
        const on = pathname === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            className={`rk-tab ${on ? "on" : ""} ${tab.center ? "center" : ""}`}
            aria-current={on ? "page" : undefined}
            onClick={() => {
              if (tab.id === "/book") go("/book", { step: 1 });
              else go(tab.id);
            }}
          >
            <span className="rk-tab-ico" style={{ position: "relative" }}>
              <Icon size={24} strokeWidth={1.75} fill={on || tab.center ? "currentColor" : "none"} />
              {tab.id === "/home" && unread > 0 && <span className="rk-badge">{unread}</span>}
            </span>
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}

export function ScreenContainer({
  children,
  mode = "inline",
  title,
  subtitle,
  right,
  footer,
  tabBar = false,
  lock = false,
  onScroll,
  fallback,
  explicitBack = false,
  header,
}: {
  children: ReactNode;
  mode?: "inline" | "large" | "overlay" | "none";
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  footer?: ReactNode;
  tabBar?: boolean;
  lock?: boolean;
  onScroll?: (top: number) => void;
  fallback?: string;
  explicitBack?: boolean;
  header?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const locationKey = useRouterState({ select: (state) => state.location.href });
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.scrollTop = 0;
    setScrolled(false);
  }, [locationKey]);
  const reserveBar = mode === "inline" || (mode === "large" && Boolean(right));
  const head = mode === "none" || mode === "overlay" ? "0px" : reserveBar ? "calc(var(--safe-t) + 44px)" : "var(--safe-t)";
  const tab = tabBar ? "calc(49px + var(--safe-b))" : "0px";
  const foot = footer ? "74px" : "0px";

  return (
    <div className="rk-screen" style={{ ["--head-space" as string]: head, ["--tab-space" as string]: tab, ["--foot-space" as string]: foot, background: explicitBack ? "var(--elevated)" : undefined }}>
      {lock ? (
        <div className="rk-lock">{children}</div>
      ) : (
        <div
          className="rk-scroll"
          ref={ref}
          onScroll={(event) => {
            const top = event.currentTarget.scrollTop;
            setScrolled(top > 8);
            onScroll?.(top);
          }}
        >
          {mode === "large" && (
            <div className="rk-large">
              <h1>{title}</h1>
              {subtitle && <p>{subtitle}</p>}
            </div>
          )}
          {children}
        </div>
      )}
      {header}
      {!header && mode === "large" && <LargeTitleHeader title={title || ""} right={right} scrolled={scrolled} />}
      {!header && mode === "inline" && <AppHeader title={title} right={right} scrolled={scrolled} fallback={fallback} explicitBack={explicitBack} />}
      {footer}
      {tabBar && <BottomTabBar />}
    </div>
  );
}

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const startY = useRef(0);
  const [dy, setDy] = useState(0);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    document.body.dataset.sheet = open ? "open" : "";
    return () => {
      document.body.dataset.sheet = "";
    };
  }, [open]);
  if (!open || !mounted) return null;
  const phone = document.getElementById("app-phone");
  if (!phone) return null;
  return createPortal(
    <div className="rk-sheet-back" onClick={onClose} role="presentation">
      <div
        className="rk-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ transform: dy > 0 ? `translateY(${dy}px)` : undefined }}
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => {
          startY.current = event.clientY;
        }}
        onPointerMove={(event) => {
          if (event.clientY - startY.current > 0 && event.currentTarget.scrollTop <= 0) {
            setDy(event.clientY - startY.current);
          }
        }}
        onPointerUp={() => {
          if (dy > 80) onClose();
          setDy(0);
        }}
      >
        <div className="rk-handle" />
        {title && <h2>{title}</h2>}
        {children}
      </div>
    </div>,
    phone,
  );
}

export function AlertHost() {
  const { alert } = useApp();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!alert || !mounted) return null;
  const phone = document.getElementById("app-phone");
  if (!phone) return null;
  const close = (value: boolean) => {
    alert.resolve(value);
  };
  return createPortal(
    <div className="rk-alert-back" onClick={() => close(false)}>
      <div className="rk-alert" role="alertdialog" aria-modal="true" aria-labelledby="alert-title" onClick={(event) => event.stopPropagation()}>
        <h2 id="alert-title">{alert.title}</h2>
        <p>{alert.message}</p>
        <div className="rk-alert-actions">
          {alert.cancelLabel !== "" && (
            <button type="button" onClick={() => close(false)}>
              {alert.cancelLabel || "Cancel"}
            </button>
          )}
          <button type="button" className={alert.destructive ? "danger" : ""} onClick={() => close(true)}>
            {alert.confirmLabel || "OK"}
          </button>
        </div>
      </div>
    </div>,
    phone,
  );
}

export function ToastHost() {
  const { toasts } = useApp();
  const { pathname } = useGo();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const phone = document.getElementById("app-phone");
  if (!phone || toasts.length === 0) return null;
  const bottom = isTab(pathname) ? "65px" : "16px";
  return createPortal(
    <>
      {toasts.map((item) => (
        <div key={item.id} className="rk-toast" style={{ ["--toast-b" as string]: bottom }} role="status">
          {item.message}
        </div>
      ))}
    </>,
    phone,
  );
}

export function Skeleton({ height = 16, width = "100%", radius = 12 }: { height?: number; width?: string | number; radius?: number }) {
  return <div className="rk-skel" style={{ height, width, borderRadius: radius }} />;
}

export function EmptyState({
  image,
  title,
  text,
  action,
  onAction,
}: {
  image: ImageKey;
  title: string;
  text: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="rk-empty">
      <img src={images[image]} alt="" />
      <h2>{title}</h2>
      <p>{text}</p>
      {action && (
        <div style={{ width: "100%", marginTop: 8 }}>
          <Button onClick={onAction}>{action}</Button>
        </div>
      )}
    </div>
  );
}

export function StatusBadge({ status }: { status: "pending" | "confirmed" | "completed" | "cancelled" }) {
  return <span className={`rk-status ${status}`}>{ui.status[status]}</span>;
}

export function CalendarMonth({
  value,
  onChange,
}: {
  value: string;
  onChange: (iso: string) => void;
}) {
  const today = todayIso();
  const base = value ? value : today;
  const [y, m] = base.split("-").map(Number);
  const [cursor, setCursor] = useState({ y, m: m - 1 });
  const [jump, setJump] = useState(false);
  const first = new Date(cursor.y, cursor.m, 1);
  const start = first.getDay();
  const count = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const label = first.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const cells: Array<number | null> = [...Array(start).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)];
  const months = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(Number(today.slice(0, 4)), Number(today.slice(5, 7)) - 1 + index, 1);
    return { y: date.getFullYear(), m: date.getMonth(), label: date.toLocaleDateString("en-US", { month: "long", year: "numeric" }) };
  });
  return (
    <div className="rk-cal">
      <div className="rk-cal-head">
        <button type="button" aria-label="Previous month" onClick={() => setCursor((c) => (c.m === 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m: c.m - 1 }))}>
          <ChevronLeft size={22} />
        </button>
        <button type="button" className="rk-link" onClick={() => setJump(true)}>
          {label}
        </button>
        <button type="button" aria-label="Next month" onClick={() => setCursor((c) => (c.m === 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m: c.m + 1 }))}>
          <ChevronRight size={22} />
        </button>
      </div>
      <div className="rk-cal-grid">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
          <span key={`${day}${index}`} className="rk-dow">
            {day}
          </span>
        ))}
        {cells.map((day, index) => {
          if (!day) return <span key={`e${index}`} />;
          const iso = toIso(cursor.y, cursor.m, day);
          const disabled = !dateAvailable(iso);
          return (
            <button key={iso} type="button" className={`rk-day ${iso === today ? "today" : ""} ${iso === value ? "on" : ""}`} disabled={disabled} onClick={() => onChange(iso)}>
              {day}
            </button>
          );
        })}
      </div>
      <DatePickerSheet
        open={jump}
        onClose={() => setJump(false)}
        months={months}
        onPick={(next) => {
          setCursor(next);
          setJump(false);
        }}
      />
    </div>
  );
}

export function DatePickerSheet({
  open,
  onClose,
  months,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  months: { y: number; m: number; label: string }[];
  onPick: (value: { y: number; m: number }) => void;
}) {
  return (
    <Sheet open={open} onClose={onClose} title="Choose a month">
      <InsetGroupedList>
        {months.map((month) => (
          <ListItem key={month.label} title={month.label} chevron onPress={() => onPick({ y: month.y, m: month.m })} />
        ))}
      </InsetGroupedList>
    </Sheet>
  );
}

export function TimeSlotGrid({
  date,
  value,
  onChange,
}: {
  date: string;
  value: string;
  onChange: (label: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {periods.map((period) => (
        <div key={period}>
          <p className="rk-label" style={{ marginBottom: 8 }}>{period}</p>
          <div className="rk-slots">
            {timeSlots
              .filter((slot) => slot.period === period)
              .map((slot) => {
                const open = date ? slotAvailable(date, slot) : false;
                return (
                  <button key={slot.id} type="button" className={`rk-slot ${value === slot.label ? "on" : ""}`} disabled={!open} onClick={() => onChange(slot.label)}>
                    {slot.label}
                  </button>
                );
              })}
          </div>
        </div>
      ))}
      <p className="rk-help">Times shown in {content.contact.timezone}.</p>
    </div>
  );
}

export function OfflineBanner() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);
  if (online) return null;
  return (
    <div className="rk-banner" role="status">
      <span>{ui.offline}</span>
      <button type="button" className="rk-link" onClick={() => setOnline(navigator.onLine)}>
        {ui.retry}
      </button>
    </div>
  );
}
