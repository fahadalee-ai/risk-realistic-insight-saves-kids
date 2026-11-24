import { createFileRoute } from "@tanstack/react-router";
import { ContactScreen } from "../screens/info-screens";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact · RISK" }] }),
  component: ContactScreen,
});
