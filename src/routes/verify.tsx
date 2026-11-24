import { createFileRoute } from "@tanstack/react-router";
import { VerifyScreen } from "../screens/auth-screens";

export const Route = createFileRoute("/verify")({
  head: () => ({ meta: [{ title: "Verify Email · RISK" }] }),
  component: VerifyScreen,
});
