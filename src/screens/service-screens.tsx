import { useMemo, useState } from "react";
import { Check, ChevronRight, MessageSquare, Phone, Share2 } from "lucide-react";
import { content } from "../data/content.js";
import { images } from "../data/images";
import { serviceById, shareText } from "../lib/format";
import { useApp } from "../lib/store";
import { useGo } from "../lib/nav";
import { Button, Chip, FlowStepper, InsetGroupedList, ListItem, ScreenContainer, SectionHeader } from "../components/ios";

const ui = content.ui;

export function ServicesScreen() {
  const { go } = useGo();
  const { patchBooking } = useApp();
  const [query, setQuery] = useState("");
  const [audience, setAudience] = useState("All");
  const list = content.services.filter((service) => {
    const matchesQuery = `${service.title} ${service.short}`.toLowerCase().includes(query.toLowerCase());
    const matchesAudience = audience === "All" || service.audience.includes(audience);
    return matchesQuery && matchesAudience;
  });

  return (
    <ScreenContainer mode="inline" title={ui.tabs.services} fallback="/profile">
      <div className="rk-stack" style={{ paddingTop: 8 }}>
        <label className="rk-search">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={ui.searchServices} aria-label={ui.searchServices} />
        </label>
        <div className="rk-chiprow rk-pad">
          {content.audiences.map((item) => (
            <Chip key={item} selected={audience === item} onClick={() => setAudience(item)}>
              {item}
            </Chip>
          ))}
        </div>
        <div className="rk-pad" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {list.map((service) => (
            <button key={service.id} type="button" className="rk-card rk-press" onClick={() => go(`/service/${service.id}`)}>
              <img src={images[service.image as keyof typeof images]} alt="" style={{ height: 140, width: "100%", objectFit: "cover" }} />
              <div className="rk-card-pad">
                <div className="rk-inline">
                  <strong className="rk-body">{service.title}</strong>
                  <ChevronRight size={18} />
                </div>
                <p className="rk-secondary" style={{ marginTop: 4 }}>{service.short}</p>
                <span className="rk-chip" style={{ marginTop: 8 }}>{service.duration}</span>
              </div>
            </button>
          ))}
          <div className="rk-talk">
            <h2>{ui.notSure}</h2>
            <Button
              onClick={() => {
                patchBooking({ serviceId: "consultation", mode: "new", rescheduleId: "" });
                go("/book", { step: 1 });
              }}
            >
              {ui.bookConsult}
            </Button>
          </div>
        </div>
      </div>
    </ScreenContainer>
  );
}

export function ServiceDetailScreen({ serviceId }: { serviceId: string }) {
  const service = serviceById(serviceId);
  const { go } = useGo();
  const { patchBooking, toast } = useApp();
  const [top, setTop] = useState(0);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const related = useMemo(() => content.services.filter((item) => item.id !== serviceId).slice(0, 4), [serviceId]);
  if (!service) {
    return (
      <ScreenContainer mode="inline" title={ui.tabs.services}>
        <p className="rk-pad">This service is unavailable.</p>
      </ScreenContainer>
    );
  }
  const collapsed = top > 160;
  return (
    <ScreenContainer
      mode="overlay"
      onScroll={setTop}
      header={
        <header className={`rk-header ${collapsed ? "solid hairline" : ""}`}>
          <div className="rk-bar">
            <div className="rk-bar-side">
              <button type="button" className={`rk-icon rk-press ${collapsed ? "" : "round"}`} aria-label={ui.back} onClick={() => history.back()}>
                <ChevronRight size={22} style={{ transform: "rotate(180deg)" }} />
              </button>
            </div>
            <div className="rk-bar-title" style={{ opacity: collapsed ? 1 : 0 }}>{service.title}</div>
            <div className="rk-bar-side right">
              <button
                type="button"
                className={`rk-icon rk-press ${collapsed ? "" : "round"}`}
                aria-label={ui.share}
                onClick={async () => {
                  const result = await shareText(service.title, `${service.title}. ${service.short}`);
                  if (result === "copied") toast(ui.copied);
                }}
              >
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </header>
      }
      footer={
        <div className="rk-actionbar">
          <button type="button" className="rk-icon" aria-label={ui.call} onClick={() => { window.location.href = `tel:${content.contact.phoneTel}`; }}>
            <Phone />
          </button>
          <button type="button" className="rk-icon" aria-label={ui.message} onClick={() => { window.location.href = `sms:${content.contact.phoneTel}`; }}>
            <MessageSquare />
          </button>
          <Button
            onClick={() => {
              patchBooking({ serviceId: service.id, mode: "new", rescheduleId: "" });
              go("/book", { step: 1 });
            }}
          >
            {ui.bookThis}
          </Button>
        </div>
      }
    >
      <div className="rk-detail-hero">
        <img src={images[service.image as keyof typeof images]} alt="" />
        <div className="rk-scrim" />
      </div>
      <div className="rk-pad rk-stack" style={{ paddingTop: 16 }}>
        <div>
          <span className="rk-chip on">{service.price}</span>
          <h1 className="rk-h1" style={{ marginTop: 8 }}>{service.title}</h1>
        </div>
        <InsetGroupedList>
          <ListItem title="Duration" trailing={<span>{service.duration}</span>} />
          <ListItem title="Format" trailing={<span>{service.format}</span>} />
          <ListItem title="Audience" trailing={<span>{service.audience.join(", ")}</span>} />
        </InsetGroupedList>
        <section>
          <h2 className="rk-h2">{ui.aboutService}</h2>
          <p className="rk-body rk-copy" style={{ marginTop: 8 }}>{service.about}</p>
        </section>
        <section>
          <h2 className="rk-h2">{ui.learn}</h2>
          {service.learn.map((item) => (
            <div key={item} className="rk-checkline">
              <Check size={18} color="var(--primary-text)" />
              <span>{item}</span>
            </div>
          ))}
        </section>
        <section>
          <h2 className="rk-h2">{ui.who}</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
            {service.audience.map((item) => (
              <Chip key={item}>{item}</Chip>
            ))}
          </div>
        </section>
        <section>
          <h2 className="rk-h2" style={{ marginBottom: 8 }}>{ui.how}</h2>
          <FlowStepper />
        </section>
        <section>
          <h2 className="rk-h2">{ui.faqs}</h2>
          <InsetGroupedList>
            {content.serviceFaqs.map((faq) => (
              <div key={faq.q}>
                <button type="button" className="rk-faq" aria-expanded={openFaq === faq.q} onClick={() => setOpenFaq(openFaq === faq.q ? null : faq.q)}>
                  <span className="rk-inline">
                    <span>{faq.q}</span>
                    <ChevronRight size={18} style={{ transform: openFaq === faq.q ? "rotate(90deg)" : undefined, transition: "transform 120ms" }} />
                  </span>
                </button>
                {openFaq === faq.q && <p className="rk-pad rk-secondary rk-copy" style={{ paddingBottom: 12 }}>{faq.a}</p>}
              </div>
            ))}
          </InsetGroupedList>
        </section>
        <section>
          <SectionHeader title={ui.related} />
          <div className="rk-carousel" style={{ marginTop: 8 }}>
            {related.map((item) => (
              <button key={item.id} type="button" className="rk-service-card rk-press" onClick={() => go(`/service/${item.id}`)}>
                <img src={images[item.image as keyof typeof images]} alt="" />
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.short}</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </ScreenContainer>
  );
}
