import { createFileRoute } from "@tanstack/react-router";
import { SplashScreen } from "../screens/auth-screens";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "RISK | Realistic Insight Saves Kids" }] }),
  component: SplashScreen,
});
