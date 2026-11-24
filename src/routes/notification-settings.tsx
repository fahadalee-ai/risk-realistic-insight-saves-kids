import { createFileRoute } from "@tanstack/react-router";
import { NotificationSettingsScreen } from "../screens/profile-screens";

export const Route = createFileRoute("/notification-settings")({
  head: () => ({ meta: [{ title: "Notifications · RISK" }] }),
  component: NotificationSettingsScreen,
});
