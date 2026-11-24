import { createFileRoute } from "@tanstack/react-router";
import { LoginScreen } from "../screens/auth-screens";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign In · RISK" }] }),
  component: LoginScreen,
});
