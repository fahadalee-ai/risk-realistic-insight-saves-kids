import { createFileRoute } from "@tanstack/react-router";
import { PasswordScreen } from "../screens/profile-screens";

export const Route = createFileRoute("/password")({
  head: () => ({ meta: [{ title: "Password · RISK" }] }),
  component: PasswordScreen,
});
