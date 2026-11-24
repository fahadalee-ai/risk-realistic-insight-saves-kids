import { useEffect, useState } from "react";
import { Bell, BookOpen, CalendarPlus, LayoutGrid, MessageSquare, Phone, UserRound } from "lucide-react";
import { content } from "../data/content.js";
import { images } from "../data/images";
import { formatShortDate, serviceById } from "../lib/format";
import { useApp } from "../lib/store";
import { useGo } from "../lib/nav";
import { Avatar, Button, Card, EmptyState, ScreenContainer, SectionHeader, Skeleton, StatusBadge } from "../components/ios";

const ui = content.ui;
let warmed = false;

export function HomeScreen() {
  const { user, state, ownerId, patchBooking } = useApp();
  const { go } = useGo();
  const [loading, setLoading] = useState(!warmed);
  const unread = state.notices.filter((item) => item.userId === ownerId && !item.read).length;
  const upcoming = state.appointments.find(
    (item) => item.userId === ownerId && (item.status === "pending" || item.status === "confirmed"),
  );

  useEffect(() => {
    if (warmed) return;
    const timer = window.setTimeout(() => {
      warmed = true;
      setLoading(false);
    }, 700);
    return () => window.clearTimeout(timer);
  }, []);

  const title = user ? `${ui.hello}, ${user.firstName}` : ui.guestHello;
  const right = (
    <>
      <button type="button" className="rk-icon" aria-label={ui.notifications} onClick={() => go("/notifications")} style={{ position: "relative" }}>
        <Bell size={24} />
        {unread > 0 && <span className="rk-badge">{unread}</span>}
      </button>
      <button type="button" className="rk-icon" aria-label={ui.tabs.profile} onClick={() => go("/profile")}>
        {user ? <Avatar name={`${user.firstName} ${user.lastName}`} src={user.avatar} size={32} /> : <UserRound size={24} />}
      </button>
    </>
  );

  return (
    <ScreenContainer mode="large" title={title} subtitle={ui.helpToday} right={right} tabBar>
      {loading ? (
        <div className="rk-pad rk-stack">
          <Skeleton height={220} radius={20} />
          <Skeleton height={72} />
          <Skeleton height={140} />
        </div>
      ) : (
        <div className="rk-stack" style={{ paddingTop: 8 }}>
          <div className="rk-pad">
            <div className="rk-hero">
              <img src={images.hero} alt="Youth standing together outdoors" />
              <div className="rk-scrim" />
              <div className="rk-hero-copy">
                <h2>{content.brand.hero}</h2>
                <p>{content.brand.heroSupport}</p>
                <div className="rk-pills">
                  <Button className="slim" onClick={() => go("/book", { step: 1 })}>
                    {ui.book}
                  </Button>
                  <Button className="slim" variant="secondary" onClick={() => go("/about")}>
                    {ui.learnMore}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="rk-tiles">
              {[
                { label: ui.tabs.book, icon: CalendarPlus, to: "/book" },
                { label: ui.tabs.services, icon: LayoutGrid, to: "/services" },
                { label: ui.tabs.resources, icon: BookOpen, to: "/resources" },
                { label: ui.contactUs, icon: Phone, to: "/contact" },
              ].map((item) => (
                <button key={item.label} type="button" className="rk-tile rk-press" onClick={() => (item.to === "/book" ? go("/book", { step: 1 }) : go(item.to))}>
                  <i>
                    <item.icon size={24} />
                  </i>
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <SectionHeader title={ui.services} action={ui.seeAll} onAction={() => go("/services")} />
            <div className="rk-carousel rk-pad" style={{ marginTop: 8 }}>
              {content.services.map((service) => (
                <button key={service.id} type="button" className="rk-service-card rk-press" onClick={() => go(`/service/${service.id}`)}>
                  <img src={images[service.image as keyof typeof images]} alt="" />
                  <div>
                    <strong>{service.title}</strong>
                    <span>{service.short}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rk-pad">
            <SectionHeader title={ui.upcoming} />
            {upcoming ? (
              <Card className="rk-card-pad">
                <div className="rk-inline">
                  <span className="rk-chip on">{formatShortDate(upcoming.date)}</span>
                  <StatusBadge status={upcoming.status} />
                </div>
                <h3 className="rk-h3" style={{ marginTop: 12 }}>{serviceById(upcoming.serviceId)?.title}</h3>
                <p className="rk-secondary">{upcoming.time} · {content.contact.timezone}</p>
                <div className="rk-row-actions" style={{ marginTop: 12 }}>
                  <Button variant="secondary" onClick={() => {
                    patchBooking({
                      mode: "reschedule",
                      rescheduleId: upcoming.id,
                      serviceId: upcoming.serviceId,
                      type: upcoming.type,
                      date: upcoming.date,
                      time: upcoming.time,
                    });
                    go("/book", { step: 3 });
                  }}>
                    {ui.reschedule}
                  </Button>
                  <Button variant="ghost" onClick={() => go(`/appointment/${upcoming.id}`)}>
                    {ui.details}
                  </Button>
                </div>
              </Card>
            ) : (
              <EmptyState image="emptyAppointments" title={ui.bookFirst} text={ui.bookFirstText} action={ui.book} onAction={() => go("/book", { step: 1 })} />
            )}
          </div>

          <div className="rk-pad">
            <SectionHeader title={ui.missionTitle} action={ui.readMore} onAction={() => go("/about")} />
            <Card onClick={() => go("/about")}>
              <img src={images.about} alt="Hands stacked together" style={{ height: 160, width: "100%", objectFit: "cover" }} />
              <div className="rk-card-pad">
                <p className="rk-body rk-copy">{content.mission}</p>
              </div>
            </Card>
          </div>

          <div>
            <SectionHeader title={ui.impact} />
            <div className="rk-stats">
              {content.stats.map((stat) => (
                <div key={stat.label} className="rk-stat">
                  <b>{stat.value}</b>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionHeader title={ui.tipsTitle} />
            <div className="rk-carousel rk-pad" style={{ marginTop: 8 }}>
              {content.tips.map((tip) => (
                <button key={tip.title} type="button" className="rk-tip rk-press" onClick={() => go(`/resource/${tip.resourceId}`)}>
                  <strong>{tip.title}</strong>
                  <p>{tip.text}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rk-talk">
            <h2>{ui.talk}</h2>
            <p className="rk-body">{content.contact.phone}</p>
            <p className="rk-secondary">{content.contact.hours}</p>
            <div className="rk-row-actions">
              <Button className="slim" onClick={() => { window.location.href = `tel:${content.contact.phoneTel}`; }}>
                <Phone size={18} /> {ui.call}
              </Button>
              <Button className="slim" variant="secondary" onClick={() => { window.location.href = `sms:${content.contact.phoneTel}`; }}>
                <MessageSquare size={18} /> {ui.message}
              </Button>
            </div>
          </div>

          <p className="rk-foot">
            {content.brand.title}
            <br />
            Version {content.brand.version}
          </p>
        </div>
      )}
    </ScreenContainer>
  );
}
