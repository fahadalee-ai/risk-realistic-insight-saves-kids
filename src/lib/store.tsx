import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { content } from "../data/content.js";
import { uid } from "./format";

export type Role = (typeof content.roles)[number];
export type Session =
  | { status: "out" }
  | { status: "guest" }
  | { status: "authed"; userId: string };

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryId: string;
  password: string;
  role: Role;
  avatar?: string;
};

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";

export type Appointment = {
  id: string;
  reference: string;
  userId: string;
  serviceId: string;
  type: "in-person" | "phone" | "video";
  date: string;
  time: string;
  status: AppointmentStatus;
  forWhom: "myself" | "child" | "group";
  name: string;
  email: string;
  phone: string;
  childAge: string;
  organization: string;
  attendees: number;
  topics: string[];
  notes: string;
  cancelReason?: string;
};

export type BookingDraft = {
  serviceId: string;
  type: Appointment["type"];
  date: string;
  time: string;
  forWhom: Appointment["forWhom"];
  name: string;
  email: string;
  phone: string;
  countryId: string;
  childAge: string;
  organization: string;
  attendees: number;
  topics: string[];
  notes: string;
  terms: boolean;
  mode: "new" | "reschedule";
  rescheduleId: string;
};

export type Notice = {
  id: string;
  userId: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  href: string;
  createdAt: number;
};

type NotifSettings = {
  reminders: boolean;
  tips: boolean;
  news: boolean;
  push: boolean;
  email: boolean;
};

type Persisted = {
  seenOnboarding: boolean;
  session: Session;
  users: User[];
  appointments: Appointment[];
  notices: Notice[];
  saved: Record<string, string[]>;
  appearance: "system" | "light" | "dark";
  notifSettings: NotifSettings;
  booking: BookingDraft;
  pendingUser: User | null;
  lastReference: string;
};

type AlertOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type ToastItem = { id: string; message: string };

const emptyBooking = (): BookingDraft => ({
  serviceId: "",
  type: "in-person",
  date: "",
  time: "",
  forWhom: "myself",
  name: "",
  email: "",
  phone: "",
  countryId: "us",
  childAge: "",
  organization: "",
  attendees: 10,
  topics: [],
  notes: "",
  terms: false,
  mode: "new",
  rescheduleId: "",
});

const initial = (): Persisted => ({
  seenOnboarding: false,
  session: { status: "out" },
  users: [],
  appointments: [],
  notices: [],
  saved: {},
  appearance: "system",
  notifSettings: { reminders: true, tips: true, news: true, push: true, email: true },
  booking: emptyBooking(),
  pendingUser: null,
  lastReference: "",
});

const KEY = "risk-app-v1";

type AppContextValue = {
  ready: boolean;
  state: Persisted;
  user: User | null;
  ownerId: string;
  setSeenOnboarding: () => void;
  signIn: (email: string, password: string) => string | null;
  signInProvider: (provider: "apple" | "google") => void;
  beginRegister: (user: Omit<User, "id">) => string | null;
  completeVerify: () => void;
  resetPassword: (email: string, password: string) => string | null;
  continueGuest: () => void;
  signOut: () => void;
  deleteAccount: () => void;
  updateProfile: (patch: Partial<User>) => void;
  changePassword: (current: string, next: string) => string | null;
  patchBooking: (patch: Partial<BookingDraft>) => void;
  resetBooking: () => void;
  confirmBooking: () => Appointment | null;
  cancelAppointment: (id: string, reason: string) => void;
  toggleSave: (resourceId: string) => boolean;
  isSaved: (resourceId: string) => boolean;
  markAllRead: () => void;
  markRead: (id: string) => void;
  deleteNotice: (id: string) => void;
  addNotice: (title: string, body: string, href: string) => void;
  setAppearance: (value: Persisted["appearance"]) => void;
  setNotif: (key: keyof NotifSettings, value: boolean) => void;
  toast: (message: string) => void;
  confirm: (options: AlertOptions) => Promise<boolean>;
  toasts: ToastItem[];
  alert: (AlertOptions & { resolve: (value: boolean) => void }) | null;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(initial);
  const [ready, setReady] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [alert, setAlert] = useState<AppContextValue["alert"]>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Persisted;
        setState({ ...initial(), ...parsed, booking: { ...emptyBooking(), ...parsed.booking } });
      }
    } catch {
      /* keep defaults */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, ready]);

  useEffect(() => {
    const root = document.documentElement;
    if (state.appearance === "system") root.removeAttribute("data-theme");
    else root.dataset.theme = state.appearance;
  }, [state.appearance]);

  const user = useMemo(() => {
    const session = state.session;
    if (session.status !== "authed") return null;
    return state.users.find((item) => item.id === session.userId) || null;
  }, [state.session, state.users]);

  const ownerId = state.session.status === "authed" ? state.session.userId : "guest";

  const toast = (message: string) => {
    const id = uid("toast");
    setToasts((list) => [...list, { id, message }]);
    window.setTimeout(() => setToasts((list) => list.filter((item) => item.id !== id)), 3000);
  };

  const confirm = (options: AlertOptions) =>
    new Promise<boolean>((resolve) => {
      setAlert({
        ...options,
        resolve: (value) => {
          setAlert(null);
          resolve(value);
        },
      });
    });

  const value: AppContextValue = {
    ready,
    state,
    user,
    ownerId,
    toasts,
    alert,
    toast,
    confirm,
    setSeenOnboarding: () => setState((s) => ({ ...s, seenOnboarding: true })),
    signIn: (email, password) => {
      const found = state.users.find((item) => item.email.toLowerCase() === email.trim().toLowerCase());
      if (!found) return content.ui.noAccount;
      if (found.password !== password) return content.ui.badPassword;
      setState((s) => ({ ...s, session: { status: "authed", userId: found.id } }));
      return null;
    },
    signInProvider: (provider) => {
      const email = provider === "apple" ? "taylor@icloud.example" : "jordan@gmail.example";
      const firstName = provider === "apple" ? "Taylor" : "Jordan";
      setState((s) => {
        let existing = s.users.find((item) => item.email === email);
        const users = existing
          ? s.users
          : [
              ...s.users,
              {
                id: uid("user"),
                firstName,
                lastName: "Morgan",
                email,
                phone: "5551234567",
                countryId: "us",
                password: "provider",
                role: "Parent/Guardian" as Role,
              },
            ];
        existing = users.find((item) => item.email === email)!;
        return { ...s, users, session: { status: "authed", userId: existing.id } };
      });
    },
    beginRegister: (draft) => {
      if (state.users.some((item) => item.email.toLowerCase() === draft.email.toLowerCase())) {
        return content.ui.emailTaken;
      }
      setState((s) => ({ ...s, pendingUser: { ...draft, id: uid("user") } }));
      return null;
    },
    completeVerify: () => {
      setState((s) => {
        const pending = s.pendingUser ?? {
          id: uid("user"),
          firstName: "Guest",
          lastName: "",
          email: "",
          phone: "",
          countryId: "us",
          password: "",
          role: content.roles[0],
        };
        return {
          ...s,
          users: [...s.users, pending],
          session: { status: "authed", userId: pending.id },
          pendingUser: null,
          notices: [
            {
              id: uid("note"),
              userId: pending.id,
              title: content.brand.title,
              body: content.story,
              time: "Just now",
              read: false,
              href: "/about",
              createdAt: Date.now(),
            },
            ...s.notices,
          ],
        };
      });
    },
    resetPassword: (email, password) => {
      const found = state.users.find((item) => item.email.toLowerCase() === email.trim().toLowerCase());
      if (!found) return content.ui.noAccount;
      setState((s) => ({
        ...s,
        users: s.users.map((item) => (item.id === found.id ? { ...item, password } : item)),
      }));
      return null;
    },
    continueGuest: () => setState((s) => ({ ...s, session: { status: "guest" } })),
    signOut: () => setState((s) => ({ ...s, session: { status: "out" } })),
    deleteAccount: () =>
      setState((s) => {
        if (s.session.status !== "authed") return { ...s, session: { status: "out" } };
        const userId = s.session.userId;
        return {
          ...s,
          session: { status: "out" },
          users: s.users.filter((item) => item.id !== userId),
          appointments: s.appointments.filter((item) => item.userId !== userId),
          notices: s.notices.filter((item) => item.userId !== userId),
        };
      }),
    updateProfile: (patch) =>
      setState((s) => ({
        ...s,
        users: s.users.map((item) => (s.session.status === "authed" && item.id === s.session.userId ? { ...item, ...patch } : item)),
      })),
    changePassword: (current, next) => {
      if (!user || user.password !== current) return content.ui.badCurrent;
      setState((s) => ({
        ...s,
        users: s.users.map((item) => (item.id === user.id ? { ...item, password: next } : item)),
      }));
      return null;
    },
    patchBooking: (patch) => setState((s) => ({ ...s, booking: { ...s.booking, ...patch } })),
    resetBooking: () => setState((s) => ({ ...s, booking: emptyBooking() })),
    confirmBooking: () => {
      const draft = state.booking;
      if (state.booking.mode === "reschedule" && state.booking.rescheduleId) {
        setState((s) => ({
          ...s,
          appointments: s.appointments.map((item) =>
            item.id === draft.rescheduleId ? { ...item, date: draft.date, time: draft.time } : item,
          ),
          booking: emptyBooking(),
        }));
        const existing = state.appointments.find((item) => item.id === draft.rescheduleId) || null;
        return existing ? { ...existing, date: draft.date, time: draft.time } : null;
      }
      const appointment: Appointment = {
        id: uid("appt"),
        reference: `RISK-${Math.floor(10000 + Math.random() * 90000)}`,
        userId: ownerId,
        serviceId: draft.serviceId,
        type: draft.type,
        date: draft.date,
        time: draft.time,
        status: "pending",
        forWhom: draft.forWhom,
        name: draft.name,
        email: draft.email,
        phone: draft.phone,
        childAge: draft.childAge,
        organization: draft.organization,
        attendees: draft.attendees,
        topics: draft.topics,
        notes: draft.notes,
      };
      setState((s) => ({
        ...s,
        appointments: [appointment, ...s.appointments],
        booking: emptyBooking(),
        lastReference: appointment.reference,
        notices: [
          {
            id: uid("note"),
            userId: ownerId,
            title: content.ui.requested,
            body: `${appointment.reference} · ${appointment.date} · ${appointment.time}`,
            time: "Just now",
            read: false,
            href: `/appointment/${appointment.id}`,
            createdAt: Date.now(),
          },
          ...s.notices,
        ],
      }));
      return appointment;
    },
    cancelAppointment: (id, reason) =>
      setState((s) => ({
        ...s,
        appointments: s.appointments.map((item) =>
          item.id === id ? { ...item, status: "cancelled", cancelReason: reason } : item,
        ),
      })),
    toggleSave: (resourceId) => {
      const current = state.saved[ownerId] || [];
      const exists = current.includes(resourceId);
      setState((s) => ({
        ...s,
        saved: {
          ...s.saved,
          [ownerId]: exists ? current.filter((id) => id !== resourceId) : [resourceId, ...current],
        },
      }));
      return !exists;
    },
    isSaved: (resourceId) => (state.saved[ownerId] || []).includes(resourceId),
    markAllRead: () =>
      setState((s) => ({
        ...s,
        notices: s.notices.map((item) => (item.userId === ownerId ? { ...item, read: true } : item)),
      })),
    markRead: (id) =>
      setState((s) => ({
        ...s,
        notices: s.notices.map((item) => (item.id === id ? { ...item, read: true } : item)),
      })),
    deleteNotice: (id) => setState((s) => ({ ...s, notices: s.notices.filter((item) => item.id !== id) })),
    addNotice: (title, body, href) =>
      setState((s) => ({
        ...s,
        notices: [
          { id: uid("note"), userId: ownerId, title, body, time: "Just now", read: false, href, createdAt: Date.now() },
          ...s.notices,
        ],
      })),
    setAppearance: (appearance) => setState((s) => ({ ...s, appearance })),
    setNotif: (key, value) =>
      setState((s) => ({ ...s, notifSettings: { ...s.notifSettings, [key]: value } })),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
