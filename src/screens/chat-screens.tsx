import { useEffect, useRef, useState } from "react";
import { content } from "../data/content.js";
import { formatLongDate, serviceById } from "../lib/format";
import { useApp } from "../lib/store";
import { useGo } from "../lib/nav";
import { Button, EmptyState, ScreenContainer } from "../components/ios";

const ui = content.ui;

function clock(stamp: number) {
  return new Date(stamp).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function ChatListScreen() {
  const { state, ownerId } = useApp();
  const { go } = useGo();
  const mine = state.appointments.filter((item) => item.userId === ownerId);

  return (
    <ScreenContainer mode="large" title={ui.chat} tabBar>
      {mine.length === 0 ? (
        <EmptyState image="emptyAppointments" title={ui.chatEmpty} text={ui.chatEmptyText} action={ui.book} onAction={() => go("/book", { step: 1 })} />
      ) : (
        <div className="rk-pad rk-stack" style={{ paddingTop: 12 }}>
          {mine.map((item) => {
            const thread = (state.messages || []).filter((message) => message.appointmentId === item.id);
            const last = thread[thread.length - 1];
            const unread = thread.filter((message) => message.from === "admin" && !message.seen).length;
            const service = serviceById(item.serviceId);
            return (
              <button key={item.id} type="button" className="rk-card rk-card-pad rk-press" onClick={() => go(`/chat/${item.id}`)}>
                <div className="rk-inline">
                  <strong>{service?.title || ui.chatWith}</strong>
                  {unread > 0 && <span className="rk-pill-count">{unread}</span>}
                </div>
                <p className="rk-secondary" style={{ marginTop: 4 }}>{item.reference}{item.date ? ` · ${formatLongDate(item.date)}` : ""}</p>
                <p className="rk-help" style={{ marginTop: 8 }}>{last?.text || ui.chatWelcome}</p>
              </button>
            );
          })}
        </div>
      )}
    </ScreenContainer>
  );
}

export function ChatThreadScreen({ appointmentId }: { appointmentId: string }) {
  const { state, openChat, sendChat } = useApp();
  const { go } = useGo();
  const item = state.appointments.find((appointment) => appointment.id === appointmentId);
  const messages = (state.messages || []).filter((message) => message.appointmentId === appointmentId);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    openChat(appointmentId);
  }, [appointmentId, messages.length, openChat]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  if (!item) {
    return (
      <ScreenContainer mode="inline" title={ui.chat} fallback="/chats">
        <EmptyState image="emptyAppointments" title={ui.chatEmpty} text={ui.chatEmptyText} action={ui.chat} onAction={() => go("/chats")} />
      </ScreenContainer>
    );
  }

  const service = serviceById(item.serviceId);
  const send = () => {
    const next = text.trim();
    if (!next) return;
    sendChat(appointmentId, next);
    setText("");
  };

  return (
    <ScreenContainer
      mode="inline"
      title={service?.title || ui.chatWith}
      fallback="/chats"
      footer={
        <div className="rk-actionbar">
          <input
            className="rk-input rk-composer"
            value={text}
            placeholder={ui.chatPlaceholder}
            aria-label={ui.chatPlaceholder}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") send();
            }}
          />
          <Button className="slim" onClick={send}>{ui.send}</Button>
        </div>
      }
    >
      <div className="rk-thread">
        <p className="rk-help" style={{ textAlign: "center" }}>{item.reference}{item.date ? ` · ${formatLongDate(item.date)}` : ""}</p>
        {messages.map((message) => (
          <div key={message.id} className={`rk-bubble ${message.from === "user" ? "me" : "them"}`}>
            {message.from === "admin" && <strong className="rk-bubble-name">{ui.adminName}</strong>}
            <span>{message.text}</span>
            <time dateTime={new Date(message.createdAt).toISOString()}>{clock(message.createdAt)}</time>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </ScreenContainer>
  );
}
