import { createFileRoute } from "@tanstack/react-router";
import { ResourcesScreen } from "../screens/resource-screens";

export const Route = createFileRoute("/resources")({
  head: () => ({ meta: [{ title: "Resources · RISK" }] }),
  component: ResourcesScreen,
});
