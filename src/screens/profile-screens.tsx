import { useRef, useState } from "react";
import { LayoutGrid, MessageCircle } from "lucide-react";
import { content } from "../data/content.js";
import { formatLongDate, serviceById, downloadIcs } from "../lib/format";
import { useApp, type Appointment } from "../lib/store";
import { useGo } from "../lib/nav";
import {
  Avatar,
  Button,
  EmptyState,
  InsetGroupedList,
  Input,
  ListItem,
  ScreenContainer,
  SegmentedControl,
  Sheet,
  StatusBadge,
  Switch,
} from "../components/ios";

const ui = content.ui;

export function ProfileScreen() {
  const { user, state, ownerId, signOut, deleteAccount, confirm } = useApp();
  const { go, replace } = useGo();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const name = user ? `${user.firstName} ${user.lastName}` : "Guest";
  const unreadChats = (state.messages || []).filter((message) => message.from === "admin" && !message.seen && state.appointments.some((item) => item.id === message.appointmentId && item.userId === ownerId)).length;

  return (
    <ScreenContainer mode="large" title={ui.tabs.profile} tabBar>
      <div className="rk-stack" style={{ paddingTop: 8 }}>
        <div className="rk-pad">
          <div className="rk-card rk-card-pad rk-inline">
            <div className="rk-inline" style={{ gap: 12 }}>
              <Avatar name={name} src={user?.avatar} size={56} />
              <div>
                <strong className="rk-body">{name}</strong>
                <p className="rk-secondary">{user?.email || "Browsing as a guest"}</p>
              </div>
            </div>
            {user ? (
              <Button className="slim" variant="secondary" onClick={() => go("/edit-profile")}>{ui.edit}</Button>
            ) : (
              <Button className="slim" onClick={() => go("/login")}>{ui.signIn}</Button>
            )}
          </div>
        </div>
        <div className="rk-pad"><InsetGroupedList>
          <ListItem title={ui.viewAppointments} chevron onPress={() => go("/appointments")} />
          <ListItem
            title={ui.tabs.services}
            leading={<LayoutGrid size={22} color="var(--primary-text)" />}
            chevron
            onPress={() => go("/services")}
          />
          <ListItem
            title={ui.chat}
            subtitle={ui.chatHint}
            leading={<MessageCircle size={22} color="var(--primary-text)" />}
            trailing={unreadChats > 0 ? <span className="rk-pill-count">{unreadChats}</span> : undefined}
            chevron
            onPress={() => go("/chats")}
          />
          <ListItem title={ui.saved} chevron onPress={() => go("/saved")} />
          <ListItem title={ui.notifications} chevron onPress={() => go("/notifications")} />
        </InsetGroupedList></div>
        <div className="rk-pad"><InsetGroupedList>
          {user && <ListItem title={ui.editProfile} chevron onPress={() => go("/edit-profile")} />}
          {user && <ListItem title={ui.changePassword} chevron onPress={() => go("/password")} />}
          <ListItem title={ui.notifSettings} chevron onPress={() => go("/notification-settings")} />
          <ListItem title={ui.appearance} subtitle={state.appearance} chevron onPress={() => go("/appearance")} />
        </InsetGroupedList></div>
        <div className="rk-pad"><InsetGroupedList>
          <ListItem title={ui.aboutRisk} chevron onPress={() => go("/about")} />
          <ListItem title={ui.contactUs} chevron onPress={() => go("/contact")} />
          <ListItem title={ui.help} chevron onPress={() => go("/help")} />
          <ListItem title={ui.privacy} chevron onPress={() => go("/privacy")} />
          <ListItem title={ui.terms} chevron onPress={() => go("/terms")} />
        </InsetGroupedList></div>
        <div className="rk-pad"><InsetGroupedList>
          {user ? (
            <ListItem
              title={ui.logOut}
              destructive
              onPress={async () => {
                const ok = await confirm({ title: ui.logOutTitle, message: ui.logOutText, confirmLabel: ui.logOut, destructive: true });
                if (ok) {
                  signOut();
                  replace("/login");
                }
              }}
            />
          ) : (
            <ListItem title={ui.signIn} onPress={() => go("/login")} chevron />
          )}
          {user && <ListItem title={ui.deleteAccount} destructive onPress={() => setDeleteOpen(true)} />}
        </InsetGroupedList></div>
        <p className="rk-foot">Version {content.brand.version}</p>
      </div>
      <Sheet open={deleteOpen} onClose={() => setDeleteOpen(false)} title={ui.deleteTitle}>
        <p className="rk-body rk-secondary" style={{ marginBottom: 16 }}>{ui.deleteText}</p>
        <Button
          variant="destructive"
          onClick={() => {
            deleteAccount();
            setDeleteOpen(false);
            replace("/login");
          }}
        >
          {ui.deleteConfirm}
        </Button>
      </Sheet>
    </ScreenContainer>
  );
}

export function AppointmentsScreen() {
  const { state, ownerId } = useApp();
  const { go } = useGo();
  const [tab, setTab] = useState("upcoming");
  const mine = state.appointments.filter((item) => item.userId === ownerId);
  const items = mine.filter((item) => {
    if (tab === "upcoming") return item.status === "pending" || item.status === "confirmed";
    if (tab === "past") return item.status === "completed";
    return item.status === "cancelled";
  });
  const empty = tab === "upcoming"
    ? { title: ui.emptyAppointments, text: ui.emptyAppointmentsText }
    : tab === "past"
      ? { title: ui.emptyPast, text: ui.emptyPastText }
      : { title: ui.emptyCancelled, text: ui.emptyCancelledText };

  return (
    <ScreenContainer mode="inline" title={ui.viewAppointments}>
      <div className="rk-pad" style={{ paddingTop: 12 }}>
        <SegmentedControl
          label="Appointments"
          value={tab}
          onChange={setTab}
          options={[
            { id: "upcoming", label: ui.upcomingTab },
            { id: "past", label: ui.past },
            { id: "cancelled", label: ui.cancelled },
          ]}
        />
      </div>
      {items.length === 0 ? (
        <EmptyState image="emptyAppointments" title={empty.title} text={empty.text} action={ui.book} onAction={() => go("/book", { step: 1 })} />
      ) : (
        <div className="rk-pad rk-stack" style={{ paddingTop: 16 }}>
          {items.map((item) => (
            <AppointmentCard key={item.id} item={item} onOpen={() => go(`/appointment/${item.id}`)} />
          ))}
        </div>
      )}
    </ScreenContainer>
  );
}

function AppointmentCard({ item, onOpen }: { item: Appointment; onOpen: () => void }) {
  const service = serviceById(item.serviceId);
  return (
    <button type="button" className="rk-card rk-card-pad rk-press" onClick={onOpen}>
      <div className="rk-inline">
        <strong>{service?.title}</strong>
        <StatusBadge status={item.status} />
      </div>
      <p className="rk-secondary" style={{ marginTop: 8 }}>{formatLongDate(item.date)} · {item.time}</p>
      <p className="rk-help">{item.reference}</p>
    </button>
  );
}

export function AppointmentDetailScreen({ appointmentId }: { appointmentId: string }) {
  const app = useApp();
  const { go } = useGo();
  const item = app.state.appointments.find((appointment) => appointment.id === appointmentId);
  if (!item) {
    return (
      <ScreenContainer mode="inline" title={ui.details}>
        <EmptyState image="emptyAppointments" title={ui.emptyAppointments} text={ui.emptyAppointmentsText} action={ui.book} onAction={() => go("/book", { step: 1 })} />
      </ScreenContainer>
    );
  }
  const service = serviceById(item.serviceId);
  const active = item.status === "pending" || item.status === "confirmed";
  return (
    <ScreenContainer mode="inline" title={service?.title || ui.details}>
      <div className="rk-pad rk-stack" style={{ paddingTop: 16 }}>
        <div className="rk-inline">
          <StatusBadge status={item.status} />
          <span className="rk-secondary">{item.reference}</span>
        </div>
        <InsetGroupedList>
          <ListItem title={service?.title || ""} subtitle={ui.chooseService} />
          <ListItem title={content.types.find((type) => type.id === item.type)?.label || ""} subtitle={ui.appointmentType} />
          <ListItem title={formatLongDate(item.date)} subtitle={item.time} />
          <ListItem title={item.name} subtitle={`${item.email} · ${item.phone}`} />
          {item.notes && <ListItem title={ui.notes} subtitle={item.notes} />}
          {item.cancelReason && <ListItem title={ui.reason} subtitle={item.cancelReason} />}
        </InsetGroupedList>
        {item.type === "in-person" && (
          <a className="rk-card rk-card-pad" href={`https://maps.apple.com/?address=${encodeURIComponent(content.contact.address)}`}>
            <strong>{content.contact.address}</strong>
            <p className="rk-link">{ui.openMaps}</p>
          </a>
        )}
        <Button onClick={() => go(`/chat/${item.id}`)}>{ui.chatWith}</Button>
        {active && (
          <Button
            variant="secondary"
            onClick={() => {
              app.patchBooking({
                mode: "reschedule",
                rescheduleId: item.id,
                serviceId: item.serviceId,
                type: item.type,
                date: item.date,
                time: item.time,
                name: item.name,
                email: item.email,
                phone: item.phone,
                forWhom: item.forWhom,
                topics: item.topics,
                notes: item.notes,
              });
              go("/book", { step: 3 });
            }}
          >
            {ui.reschedule}
          </Button>
        )}
        <Button variant="secondary" onClick={() => go("/contact")}>{ui.contactUs}</Button>
        <Button
          variant="ghost"
          onClick={() => {
            downloadIcs({
              title: service?.title || content.brand.name,
              date: item.date,
              timeLabel: item.time,
              location: content.contact.address,
              description: item.reference,
              filename: `${item.reference}.ics`,
            });
            app.toast(ui.calendarAdded);
          }}
        >
          {ui.addCalendar}
        </Button>
      </div>
    </ScreenContainer>
  );
}

export function SavedScreen() {
  const { state, ownerId } = useApp();
  const { go } = useGo();
  const ids = state.saved[ownerId] || [];
  const items = content.resources.filter((item) => ids.includes(item.id));
  return (
    <ScreenContainer mode="inline" title={ui.saved}>
      {items.length === 0 ? (
        <EmptyState image="emptySaved" title={ui.emptySaved} text={ui.emptySavedText} action={ui.tabs.resources} onAction={() => go("/resources")} />
      ) : (
        <div className="rk-group" style={{ margin: 16 }}>
          {items.map((item) => (
            <ListItem key={item.id} title={item.title} subtitle={item.category} chevron onPress={() => go(`/resource/${item.id}`)} />
          ))}
        </div>
      )}
    </ScreenContainer>
  );
}

export function NotificationsScreen() {
  const { state, ownerId, markAllRead, markRead, deleteNotice } = useApp();
  const { go } = useGo();
  const items = state.notices.filter((item) => item.userId === ownerId);
  const today = items.filter((item) => Date.now() - item.createdAt < 1000 * 60 * 60 * 18);
  const earlier = items.filter((item) => !today.includes(item));
  const render = (list: typeof items) =>
    list.map((item) => (
      <SwipeRow key={item.id} onDelete={() => deleteNotice(item.id)}>
        <button
          type="button"
          className="rk-row rk-press"
          onClick={() => {
            markRead(item.id);
            if (item.href) go(item.href);
          }}
        >
          <span className="rk-row-text">
            <span className="rk-row-title" style={{ fontWeight: item.read ? 400 : 700 }}>{item.title}</span>
            <span className="rk-row-sub">{item.body}</span>
          </span>
        </button>
      </SwipeRow>
    ));
  return (
    <ScreenContainer
      mode="inline"
      title={ui.notifications}
      right={
        <button type="button" className="rk-link" onClick={markAllRead}>
          {ui.markRead}
        </button>
      }
    >
      {items.length === 0 ? (
        <EmptyState image="emptyNotifications" title={ui.emptyNotes} text={ui.emptyNotesText} />
      ) : (
        <div className="rk-stack" style={{ paddingTop: 12 }}>
          {today.length > 0 && (
            <div className="rk-pad">
              <h2 className="rk-h3">{ui.today}</h2>
              <div className="rk-group" style={{ marginTop: 8 }}>{render(today)}</div>
            </div>
          )}
          {earlier.length > 0 && (
            <div className="rk-pad">
              <h2 className="rk-h3">{ui.earlier}</h2>
              <div className="rk-group" style={{ marginTop: 8 }}>{render(earlier)}</div>
            </div>
          )}
        </div>
      )}
    </ScreenContainer>
  );
}

function SwipeRow({ children, onDelete }: { children: React.ReactNode; onDelete: () => void }) {
  const [x, setX] = useState(0);
  const start = useRef(0);
  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      <button type="button" onClick={onDelete} style={{ position: "absolute", inset: "0 0 0 auto", width: 88, background: "var(--primary)", color: "#fff", border: 0 }}>
        Delete
      </button>
      <div
        style={{ transform: `translateX(${x}px)`, background: "var(--card)" }}
        onPointerDown={(event) => { start.current = event.clientX; }}
        onPointerUp={(event) => {
          const dx = event.clientX - start.current;
          if (dx < -70) onDelete();
          else setX(dx < -30 ? -88 : 0);
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function EditProfileScreen() {
  const { user, updateProfile, toast } = useApp();
  const { back } = useGo();
  const file = useRef<HTMLInputElement>(null);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [capture, setCapture] = useState(false);
  const [first, setFirst] = useState(user?.firstName || "");
  const [last, setLast] = useState(user?.lastName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [role, setRole] = useState(user?.role || content.roles[0]);
  if (!user) {
    return (
      <ScreenContainer mode="inline" title={ui.editProfile}>
        <EmptyState image="emptyResults" title={ui.signIn} text={ui.guestPromptText} action={ui.signIn} onAction={() => back("/login")} />
      </ScreenContainer>
    );
  }
  return (
    <ScreenContainer mode="inline" title={ui.editProfile} footer={
      <div className="rk-actionbar">
        <Button onClick={() => { updateProfile({ firstName: first, lastName: last, phone, role }); toast(ui.profileSaved); back(); }}>
          {ui.save}
        </Button>
      </div>
    }>
      <div className="rk-pad rk-stack" style={{ paddingTop: 16, alignItems: "center" }}>
        <button type="button" onClick={() => setPhotoOpen(true)} aria-label="Change photo">
          <Avatar name={`${first} ${last}`} src={user.avatar} size={88} />
        </button>
        <Input label="First name" value={first} onChange={setFirst} />
        <Input label="Last name" value={last} onChange={setLast} />
        <Input label={ui.phone} value={phone} onChange={setPhone} inputMode="tel" />
        <div style={{ width: "100%" }}>
          <p className="rk-label" style={{ marginBottom: 8 }}>{ui.iAm}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {content.roles.map((item) => (
              <button key={item} type="button" className={`rk-chip ${role === item ? "on" : ""}`} onClick={() => setRole(item)}>{item}</button>
            ))}
          </div>
        </div>
      </div>
      <input
        ref={file}
        type="file"
        accept="image/*"
        capture={capture ? "environment" : undefined}
        hidden
        onChange={(event) => {
          const picked = event.target.files?.[0];
          if (!picked) return;
          const reader = new FileReader();
          reader.onload = () => updateProfile({ avatar: String(reader.result) });
          reader.readAsDataURL(picked);
        }}
      />
      <Sheet open={photoOpen} onClose={() => setPhotoOpen(false)} title={ui.editProfile}>
        <div className="rk-stack">
          <Button variant="secondary" onClick={() => { setCapture(true); setPhotoOpen(false); window.setTimeout(() => file.current?.click(), 50); }}>{ui.takePhoto}</Button>
          <Button variant="secondary" onClick={() => { setCapture(false); setPhotoOpen(false); window.setTimeout(() => file.current?.click(), 50); }}>{ui.choosePhoto}</Button>
          {user.avatar && <Button variant="destructive" onClick={() => { updateProfile({ avatar: "" }); setPhotoOpen(false); }}>{ui.removePhoto}</Button>}
        </div>
      </Sheet>
    </ScreenContainer>
  );
}

export function PasswordScreen() {
  const { changePassword, toast } = useApp();
  const { back } = useGo();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [error, setError] = useState("");
  return (
    <ScreenContainer mode="inline" title={ui.changePassword} footer={
      <div className="rk-actionbar">
        <Button onClick={() => {
          if (next.length < 8) return setError(ui.passwordShort);
          if (next !== confirmPw) return setError(ui.passwordMismatch);
          const message = changePassword(current, next);
          if (message) return setError(message);
          toast(ui.passwordSaved);
          back();
        }}>{ui.save}</Button>
      </div>
    }>
      <div className="rk-pad rk-stack" style={{ paddingTop: 16 }}>
        <Input label={ui.currentPassword} type="password" value={current} onChange={setCurrent} />
        <Input label={ui.newPassword} type="password" value={next} onChange={setNext} />
        <Input label={ui.confirmPassword} type="password" value={confirmPw} onChange={setConfirmPw} error={error} />
      </div>
    </ScreenContainer>
  );
}

export function NotificationSettingsScreen() {
  const { state, setNotif } = useApp();
  const settings = state.notifSettings;
  const rows = [
    ["reminders", ui.reminders],
    ["tips", ui.safetyTips],
    ["news", ui.news],
    ["push", ui.push],
    ["email", ui.emailNotes],
  ] as const;
  return (
    <ScreenContainer mode="inline" title={ui.notifSettings}>
      <div className="rk-pad" style={{ paddingTop: 16 }}>
        <InsetGroupedList>
          {rows.map(([key, label]) => (
            <div key={key} className="rk-row">
              <span className="rk-row-title">{label}</span>
              <Switch checked={settings[key]} label={label} onChange={(value) => setNotif(key, value)} />
            </div>
          ))}
        </InsetGroupedList>
      </div>
    </ScreenContainer>
  );
}

export function AppearanceScreen() {
  const { state, setAppearance } = useApp();
  return (
    <ScreenContainer mode="inline" title={ui.appearance}>
      <div className="rk-pad" style={{ paddingTop: 16 }}>
        <SegmentedControl
          label={ui.appearance}
          value={state.appearance}
          onChange={(id) => setAppearance(id as "system" | "light" | "dark")}
          options={[
            { id: "system", label: ui.system },
            { id: "light", label: ui.light },
            { id: "dark", label: ui.dark },
          ]}
        />
      </div>
    </ScreenContainer>
  );
}
