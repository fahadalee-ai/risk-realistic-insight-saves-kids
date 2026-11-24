import { createFileRoute } from "@tanstack/react-router";
import { ProfileScreen } from "../screens/profile-screens";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile · RISK" }] }),
  component: ProfileScreen,
});
