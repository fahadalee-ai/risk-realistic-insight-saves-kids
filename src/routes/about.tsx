import { createFileRoute } from "@tanstack/react-router";
import { AboutScreen } from "../screens/info-screens";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About RISK" }] }),
  component: AboutScreen,
});
