import { createFileRoute } from "@tanstack/react-router";
import { RegisterScreen } from "../screens/auth-screens";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create Account · RISK" }] }),
  component: RegisterScreen,
});
