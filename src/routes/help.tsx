import { createFileRoute } from "@tanstack/react-router";
import { HelpScreen } from "../screens/info-screens";

export const Route = createFileRoute("/help")({
  head: () => ({ meta: [{ title: "Help · RISK" }] }),
  component: HelpScreen,
});
