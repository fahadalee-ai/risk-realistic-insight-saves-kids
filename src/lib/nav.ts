import { useCanGoBack, useNavigate, useRouter, useRouterState } from "@tanstack/react-router";
import { useApp } from "./store";

const TABS = new Set(["/home", "/chats", "/resources", "/profile"]);

export function stripPath(pathname: string) {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  if (base && pathname.startsWith(base)) return pathname.slice(base.length) || "/";
  return pathname;
}

export function isTab(path: string) {
  return TABS.has(path);
}

export function useGo() {
  const navigate = useNavigate();
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const pathname = useRouterState({ select: (state) => stripPath(state.location.pathname) });
  const { dismissAlert } = useApp();

  const go = (to: string, search?: Record<string, unknown>) => {
    const tab = TABS.has(pathname) && TABS.has(to);
    document.documentElement.dataset.nav = tab ? "tab" : "push";
    navigate({ to, search } as never);
  };

  const replace = (to: string, search?: Record<string, unknown>) => {
    document.documentElement.dataset.nav = "tab";
    navigate({ to, search, replace: true } as never);
  };

  const back = (fallback = "/home") => {
    dismissAlert();
    document.documentElement.dataset.nav = "pop";
    if (canGoBack) router.history.back();
    else navigate({ to: fallback } as never);
  };

  return { go, replace, back, pathname, canGoBack };
}
