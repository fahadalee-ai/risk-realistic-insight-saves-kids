import { createFileRoute } from "@tanstack/react-router";
import { ServicesScreen } from "../screens/service-screens";

export const Route = createFileRoute("/services")({
  head: () => ({ meta: [{ title: "Services · RISK" }] }),
  component: ServicesScreen,
});
