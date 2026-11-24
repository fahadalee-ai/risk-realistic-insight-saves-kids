import { useEffect, useState } from "react";
import { content } from "../data/content.js";
import { images } from "../data/images";
import { downloadIcs, formatLongDate, serviceById, shareText } from "../lib/format";
import { useApp } from "../lib/store";
import { useGo } from "../lib/nav";
import {
  Button,
  CalendarMonth,
  Checkbox,
  Chip,
  Input,
  InsetGroupedList,
  ListItem,
  ProgressStepper,
  ScreenContainer,
  SegmentedControl,
  Sheet,
  Stepper,
  TimeSlotGrid,
} from "../components/ios";

const ui = content.ui;

export function BookScreen({ step }: { step: number }) {
  const app = useApp();
  const { booking } = app.state;
  const { go, replace } = useGo();
  const service = serviceById(booking.serviceId);
  const [ageOpen, setAgeOpen] = useState(false);
  const [doneId, setDoneId] = useState("");

  useEffect(() => {
    if (app.user && !booking.name) {
      app.patchBooking({
        name: `${app.user.firstName} ${app.user.lastName}`,
        email: app.user.email,
        phone: app.user.phone,
        countryId: app.user.countryId,
      });
    }
    // Prefill once when the signed-in user opens details.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app.user?.id]);

  const next = (to: number) => go("/book", { step: to });

  const confirm = () => {
    if (booking.mode === "reschedule") sessionStorage.setItem("risk-book-result", "updated");
    else sessionStorage.removeItem("risk-book-result");
    const appointment = app.confirmBooking();
    if (!appointment) return;
    setDoneId(appointment.id);
    app.toast(booking.mode === "reschedule" ? ui.updated : ui.requested);
    next(6);
  };

  const created = app.state.appointments.find((item) => item.id === doneId) || app.state.appointments[0];
  const updated = step === 6 && sessionStorage.getItem("risk-book-result") === "updated";

  return (
    <ScreenContainer
      key={step}
      mode="inline"
      title={step === 6 ? (updated ? ui.updated : ui.requested) : [ui.chooseService, ui.appointmentType, ui.dateTime, ui.attendee, ui.review][step - 1]}
      fallback={step === 1 ? "/home" : undefined}
      footer={
        step < 6 ? (
          <div className="rk-actionbar">
            <Button
              onClick={() => {
                if (step === 5) return confirm();
                next(step + 1);
              }}
            >
              {step === 5 ? ui.confirm : ui.continue}
            </Button>
          </div>
        ) : undefined
      }
    >
      {step < 6 && <ProgressStepper step={step} />}
      <div className="rk-pad rk-stack" style={{ paddingTop: 8 }}>
        {step === 1 &&
          content.services.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`rk-select-card rk-press ${booking.serviceId === item.id ? "on" : ""}`}
              onClick={() => app.patchBooking({ serviceId: item.id })}
            >
              <img className="rk-mini" src={images[item.image as keyof typeof images]} alt="" />
              <span style={{ flex: 1 }}>
                <strong>{item.title}</strong>
                <span className="rk-row-sub">{item.duration}</span>
              </span>
              <span className="rk-radio" />
            </button>
          ))}

        {step === 2 && (
          <>
            <SegmentedControl
              label={ui.appointmentType}
              value={booking.type}
              options={content.types}
              onChange={(id) => app.patchBooking({ type: id as typeof booking.type })}
            />
            {booking.type === "in-person" && (
              <div className="rk-card rk-card-pad">
                <h2 className="rk-h3">{ui.visit}</h2>
                <p className="rk-body" style={{ marginTop: 8 }}>{content.contact.address}</p>
                <p className="rk-secondary" style={{ marginTop: 8 }}>{content.contact.hoursNote}</p>
                <div className="rk-map" style={{ marginTop: 12 }} aria-hidden />
                <a className="rk-link" href={`https://maps.apple.com/?address=${encodeURIComponent(content.contact.address)}`}>
                  {ui.openMaps}
                </a>
              </div>
            )}
            {booking.type !== "in-person" && <p className="rk-body rk-secondary">{content.contact.hoursNote}</p>}
          </>
        )}

        {step === 3 && (
          <>
            <CalendarMonth value={booking.date} onChange={(date) => app.patchBooking({ date, time: "" })} />
            <TimeSlotGrid date={booking.date} value={booking.time} onChange={(time) => app.patchBooking({ time })} />
          </>
        )}

        {step === 4 && (
          <>
            <SegmentedControl
              label={ui.bookingFor}
              value={booking.forWhom}
              options={content.bookingFor}
              onChange={(id) => app.patchBooking({ forWhom: id as typeof booking.forWhom })}
            />
            <Input label={ui.fullName} value={booking.name} onChange={(name) => app.patchBooking({ name })} autoComplete="name" />
            <Input label={ui.email} value={booking.email} onChange={(email) => app.patchBooking({ email })} inputMode="email" />
            <Input label={ui.phone} value={booking.phone} onChange={(phone) => app.patchBooking({ phone })} inputMode="tel" />
            {booking.forWhom === "child" && (
              <button type="button" className="rk-input" onClick={() => setAgeOpen(true)}>
                {booking.childAge || ui.childAge}
              </button>
            )}
            {booking.forWhom === "group" && (
              <>
                <Input label={ui.organization} value={booking.organization} onChange={(organization) => app.patchBooking({ organization })} />
                <div className="rk-inline">
                  <span className="rk-label">{ui.attendees}</span>
                  <Stepper label={ui.attendees} value={booking.attendees} min={2} onChange={(attendees) => app.patchBooking({ attendees })} />
                </div>
              </>
            )}
            <div>
              <p className="rk-label" style={{ marginBottom: 8 }}>{ui.topic}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {content.topics.map((topic) => (
                  <Chip
                    key={topic}
                    selected={booking.topics.includes(topic)}
                    onClick={() =>
                      app.patchBooking({
                        topics: booking.topics.includes(topic)
                          ? booking.topics.filter((item) => item !== topic)
                          : [...booking.topics, topic],
                      })
                    }
                  >
                    {topic}
                  </Chip>
                ))}
              </div>
            </div>
            <Input label={ui.notes} value={booking.notes} onChange={(notes) => app.patchBooking({ notes: notes.slice(0, 500) })} multiline />
            <p className="rk-count">{booking.notes.length}/500</p>
          </>
        )}

        {step === 5 && (
          <>
            <InsetGroupedList>
              <ListItem title={service?.title || ui.chooseService} subtitle={ui.chooseService} trailing={<button type="button" className="rk-link" onClick={() => next(1)}>{ui.edit}</button>} />
              <ListItem title={content.types.find((item) => item.id === booking.type)?.label || ""} subtitle={ui.appointmentType} trailing={<button type="button" className="rk-link" onClick={() => next(2)}>{ui.edit}</button>} />
              <ListItem title={[booking.date ? formatLongDate(booking.date) : "", booking.time].filter(Boolean).join(" · ")} subtitle={ui.dateTime} trailing={<button type="button" className="rk-link" onClick={() => next(3)}>{ui.edit}</button>} />
              <ListItem title={booking.name} subtitle={[booking.email, booking.phone].filter(Boolean).join(" · ")} trailing={<button type="button" className="rk-link" onClick={() => next(4)}>{ui.edit}</button>} />
              {booking.notes && <ListItem title={ui.notes} subtitle={booking.notes} />}
            </InsetGroupedList>
            <Checkbox checked={booking.terms} onChange={(terms) => app.patchBooking({ terms })}>
              {ui.termsCheck}
            </Checkbox>
          </>
        )}

        {step === 6 && created && (
          <div style={{ textAlign: "center" }} className="rk-stack">
            <div className="rk-success-mark" aria-hidden>
              <svg width="42" height="42" viewBox="0 0 42 42">
                <path d="M12 22 l6 6 12-14" fill="none" stroke="var(--primary)" strokeWidth="3" />
              </svg>
            </div>
            <h1 className="rk-h1">{updated ? ui.updated : ui.requested}</h1>
            <p className="rk-secondary">{updated ? ui.updatedText : ui.requestedText}</p>
            <p className="rk-body">{ui.reference} {created.reference}</p>
            <div className="rk-card rk-card-pad" style={{ textAlign: "left" }}>
              <strong>{serviceById(created.serviceId)?.title}</strong>
              <p>{created.date ? formatLongDate(created.date) : ""}</p>
              <p>{created.time} · {content.contact.timezone}</p>
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                downloadIcs({
                  title: serviceById(created.serviceId)?.title || content.brand.name,
                  date: created.date,
                  timeLabel: created.time,
                  location: created.type === "in-person" ? content.contact.address : created.type,
                  description: created.reference,
                  filename: `${created.reference}.ics`,
                });
                app.toast(ui.calendarAdded);
              }}
            >
              {ui.addCalendar}
            </Button>
            <Button
              variant="secondary"
              onClick={async () => {
                const result = await shareText(created.reference, `${created.reference} ${serviceById(created.serviceId)?.title}`);
                if (result === "copied") app.toast(ui.copied);
              }}
            >
              {ui.share}
            </Button>
            <Button variant="secondary" onClick={() => go("/appointments")}>{ui.viewAppointments}</Button>
            <Button onClick={() => replace("/home")}>{ui.backHome}</Button>
          </div>
        )}
      </div>

      <Sheet open={ageOpen} onClose={() => setAgeOpen(false)} title={ui.childAge}>
        {content.ages.map((age) => (
          <button key={age} type="button" className="rk-row" onClick={() => { app.patchBooking({ childAge: age }); setAgeOpen(false); }}>
            {age}
          </button>
        ))}
      </Sheet>
    </ScreenContainer>
  );
}
