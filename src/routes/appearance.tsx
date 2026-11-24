import { createFileRoute } from "@tanstack/react-router";
import { AppearanceScreen } from "../screens/profile-screens";

export const Route = createFileRoute("/appearance")({
  head: () => ({ meta: [{ title: "Appearance · RISK" }] }),
  component: AppearanceScreen,
});
