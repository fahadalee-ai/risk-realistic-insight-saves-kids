import { createFileRoute } from "@tanstack/react-router";
import { NotificationsScreen } from "../screens/profile-screens";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications · RISK" }] }),
  component: NotificationsScreen,
});
