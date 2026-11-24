import { useMemo, useState } from "react";
import { ChevronRight, Globe, Mail, MapPin, Phone } from "lucide-react";
import { content } from "../data/content.js";
import { images } from "../data/images";
import { validEmail } from "../lib/format";
import { useApp } from "../lib/store";
import { Button, Input, InsetGroupedList, ListItem, ScreenContainer, Sheet } from "../components/ios";

const ui = content.ui;

export function AboutScreen() {
  const [web, setWeb] = useState(false);
  return (
    <ScreenContainer mode="inline" title={ui.aboutRisk}>
      <img src={images.about} alt="Hands of young people stacked together" style={{ width: "100%", height: 220, objectFit: "cover" }} />
      <div className="rk-pad rk-stack rk-copy" style={{ paddingTop: 16 }}>
        <p className="rk-secondary">{content.about.eyebrow}</p>
        <h1 className="rk-h1">{content.about.title} {content.about.highlight}</h1>
        <p className="rk-body">{content.about.description}</p>
        <section>
          <h2 className="rk-h2">{ui.missionLabel}</h2>
          <p className="rk-body" style={{ marginTop: 8 }}>{content.about.missionHeading}</p>
          <p className="rk-body" style={{ marginTop: 8 }}>{content.mission}</p>
        </section>
        <section>
          <h2 className="rk-h2">{ui.visionLabel}</h2>
          <p className="rk-body" style={{ marginTop: 8 }}>{content.about.vision}</p>
        </section>
        <section>
          <h2 className="rk-h2">{ui.ourStory}</h2>
          <p className="rk-body" style={{ marginTop: 8 }}>{content.story}</p>
          <p className="rk-body" style={{ marginTop: 8 }}>{content.about.built}</p>
          <p className="rk-quote" style={{ marginTop: 12 }}>{content.brand.quote}</p>
        </section>
        <section>
          <h2 className="rk-h2">{ui.ourValues}</h2>
          <InsetGroupedList>
            {content.values.map((value) => (
              <ListItem key={value.name} title={value.name} subtitle={value.text} />
            ))}
          </InsetGroupedList>
        </section>
        <section>
          <h2 className="rk-h2">{ui.whatWeDo}</h2>
          {content.services.slice(0, 6).map((service) => (
            <p key={service.id} className="rk-body" style={{ marginTop: 8 }}>
              <strong>{service.title}. </strong>
              {service.about}
            </p>
          ))}
        </section>
        <div className="rk-stats">
          {content.stats.map((stat) => (
            <div key={stat.label} className="rk-stat">
              <b>{stat.value}</b>
              <span>{stat.about}</span>
            </div>
          ))}
        </div>
        <Button onClick={() => setWeb(true)}>{ui.visitWebsite}</Button>
      </div>
      <Sheet open={web} onClose={() => setWeb(false)} title={content.brand.title}>
        <p className="rk-secondary" style={{ marginBottom: 12 }}>{content.brand.url}</p>
        <iframe title="RISK website" src={content.brand.url} style={{ width: "100%", height: 360, border: 0, borderRadius: 12, background: "#fff" }} />
        <div style={{ marginTop: 12 }}>
          <a className="rk-btn secondary" href={content.brand.url} target="_blank" rel="noreferrer">Open in Browser</a>
        </div>
      </Sheet>
    </ScreenContainer>
  );
}

export function ContactScreen() {
  const { toast } = useApp();
  const [form, setForm] = useState({ name: "", email: "", subject: content.subjects[0], message: "" });
  const [error, setError] = useState("");
  const [subjects, setSubjects] = useState(false);
  const set = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  return (
    <ScreenContainer mode="inline" title={ui.contactUs} footer={
      <div className="rk-actionbar">
        <Button onClick={() => {
          if (!form.name.trim() || !form.message.trim()) return setError(ui.required);
          if (!validEmail(form.email)) return setError(ui.emailInvalid);
          setError("");
          setForm({ name: "", email: "", subject: content.subjects[0], message: "" });
          toast(ui.sent);
        }}>{ui.send}</Button>
      </div>
    }>
      <div className="rk-pad rk-stack" style={{ paddingTop: 16 }}>
        <h1 className="rk-h2">{content.contact.reachTitle}</h1>
        <div className="rk-stats" style={{ padding: 0 }}>
          <a className="rk-card rk-card-pad" href={`tel:${content.contact.phoneTel}`}>
            <Phone color="var(--primary-text)" />
            <strong>{ui.call}</strong>
            <p>{content.contact.phone}</p>
          </a>
          <a className="rk-card rk-card-pad" href={`mailto:${content.contact.email}`}>
            <Mail color="var(--primary-text)" />
            <strong>{ui.emailUs}</strong>
            <p>{content.contact.email}</p>
          </a>
        </div>
        <a className="rk-card rk-card-pad" href={`https://maps.apple.com/?address=${encodeURIComponent(content.contact.address)}`}>
          <MapPin color="var(--primary-text)" />
          <strong>{ui.visit}</strong>
          <p>{content.contact.address}</p>
          <div className="rk-map" style={{ marginTop: 12 }} />
        </a>
        <a className="rk-card rk-card-pad" href={content.brand.url} target="_blank" rel="noreferrer">
          <Globe color="var(--primary-text)" />
          <strong>{ui.website}</strong>
          <p>{content.brand.url.replace("https://", "")}</p>
        </a>
        <section>
          <h2 className="rk-h3">{ui.officeHours}</h2>
          <InsetGroupedList>
            <ListItem title={content.contact.hours} subtitle={content.contact.hoursNote} />
          </InsetGroupedList>
        </section>
        <Input label={ui.name} value={form.name} onChange={(value) => set("name", value)} />
        <Input label={ui.email} value={form.email} onChange={(value) => set("email", value)} inputMode="email" />
        <button type="button" className="rk-input" onClick={() => setSubjects(true)}>{form.subject}</button>
        <Input label={ui.messageLabel} value={form.message} onChange={(value) => set("message", value)} multiline />
        {error && <p className="rk-error">{error}</p>}
        <p className="rk-help">{ui.sentText}</p>
      </div>
      <Sheet open={subjects} onClose={() => setSubjects(false)} title={ui.subject}>
        {content.subjects.map((subject) => (
          <button key={subject} type="button" className="rk-row" onClick={() => { set("subject", subject); setSubjects(false); }}>
            {subject}
          </button>
        ))}
      </Sheet>
    </ScreenContainer>
  );
}

export function HelpScreen() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return content.faqs
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => `${item.q} ${item.a}`.toLowerCase().includes(needle)),
      }))
      .filter((group) => group.items.length);
  }, [query]);
  return (
    <ScreenContainer mode="inline" title={ui.help}>
      <div className="rk-stack" style={{ paddingTop: 12 }}>
        <label className="rk-search">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={ui.searchHelp} aria-label={ui.searchHelp} />
        </label>
        {groups.length === 0 && <p className="rk-pad rk-secondary">{ui.emptySearchText}</p>}
        {groups.map((group) => (
          <div key={group.group} className="rk-pad">
            <h2 className="rk-h3">{group.group}</h2>
            <InsetGroupedList>
              {group.items.map((item) => (
                <div key={item.q}>
                  <button type="button" className="rk-faq" aria-expanded={open === item.q} onClick={() => setOpen(open === item.q ? null : item.q)}>
                    <span className="rk-inline">
                      {item.q}
                      <ChevronRight size={18} style={{ transform: open === item.q ? "rotate(90deg)" : undefined }} />
                    </span>
                  </button>
                  {open === item.q && <p className="rk-pad rk-copy rk-secondary" style={{ paddingBottom: 12 }}>{item.a}</p>}
                </div>
              ))}
            </InsetGroupedList>
          </div>
        ))}
      </div>
    </ScreenContainer>
  );
}

export function LegalScreen({ kind }: { kind: "privacy" | "terms" }) {
  const paragraphs = kind === "privacy" ? content.legal.privacy : content.legal.terms;
  return (
    <ScreenContainer mode="inline" title={kind === "privacy" ? ui.privacy : ui.terms}>
      <div className="rk-pad rk-stack rk-copy" style={{ paddingTop: 16 }}>
        {paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 32)} className="rk-body">{paragraph}</p>
        ))}
      </div>
    </ScreenContainer>
  );
}
