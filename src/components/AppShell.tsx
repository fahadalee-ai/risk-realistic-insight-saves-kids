import { useEffect, useRef, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useApp } from "../lib/store";
import { stripPath } from "../lib/nav";
import { AlertHost, OfflineBanner, ToastHost } from "./ios";

const PUBLIC = new Set(["/", "/onboarding", "/login", "/register", "/verify", "/forgot"]);
const TABS = new Set(["/home", "/services", "/resources", "/profile"]);

export function AppShell({ children }: { children: ReactNode }) {
  const { ready, state, dismissAlert } = useApp();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (router) => stripPath(router.location.pathname) });
  const dismissRef = useRef(dismissAlert);
  dismissRef.current = dismissAlert;

  useEffect(() => {
    const onPop = () => {
      document.documentElement.dataset.nav = "pop";
      dismissRef.current();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    dismissRef.current();
  }, [pathname]);

  useEffect(() => {
    const onFocus = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        window.setTimeout(() => target.scrollIntoView({ block: "center" }), 280);
      }
    };
    document.addEventListener("focusin", onFocus);
    return () => document.removeEventListener("focusin", onFocus);
  }, []);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const apply = () => {
      const phone = document.getElementById("app-phone");
      if (!phone) return;
      const overlap = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      phone.style.setProperty("--kb", `${overlap}px`);
    };
    viewport.addEventListener("resize", apply);
    viewport.addEventListener("scroll", apply);
    return () => {
      viewport.removeEventListener("resize", apply);
      viewport.removeEventListener("scroll", apply);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (state.session.status === "out" && !PUBLIC.has(pathname)) {
      document.documentElement.dataset.nav = "tab";
      navigate({ to: "/login", replace: true } as never);
    }
  }, [ready, state.session.status, pathname, navigate]);

  useEffect(() => {
    const phone = document.getElementById("app-phone");
    if (!phone) return;
    let tracking = false;
    let startX = 0;
    let startY = 0;
    let dx = 0;
    const layer = () => phone.querySelector(".rk-screen") as HTMLElement | null;
    const down = (event: PointerEvent) => {
      if (event.clientX > 24 || document.body.dataset.sheet === "open") return;
      if (TABS.has(pathname) || pathname === "/" || pathname === "/onboarding") return;
      tracking = true;
      startX = event.clientX;
      startY = event.clientY;
      dx = 0;
    };
    const move = (event: PointerEvent) => {
      if (!tracking) return;
      const next = event.clientX - startX;
      if (Math.abs(event.clientY - startY) > 40) {
        tracking = false;
        const node = layer();
        if (node) node.style.transform = "";
        return;
      }
      dx = Math.max(0, next);
      const node = layer();
      if (node) node.style.transform = `translateX(${Math.min(dx, 160)}px)`;
    };
    const up = () => {
      if (!tracking) return;
      tracking = false;
      const node = layer();
      if (node) node.style.transform = "";
      if (dx > 80) {
        document.documentElement.dataset.nav = "pop";
        window.history.back();
      }
      dx = 0;
    };
    phone.addEventListener("pointerdown", down);
    phone.addEventListener("pointermove", move);
    phone.addEventListener("pointerup", up);
    return () => {
      phone.removeEventListener("pointerdown", down);
      phone.removeEventListener("pointermove", move);
      phone.removeEventListener("pointerup", up);
    };
  }, [pathname]);

  return (
    <div className="rk-stage">
      <div className="rk-phone" id="app-phone">
        <div style={{ position: "absolute", inset: 0 }}>
          <OfflineBanner />
          {children}
        </div>
        <ToastHost />
        <AlertHost />
      </div>
    </div>
  );
}
