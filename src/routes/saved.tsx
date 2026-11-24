import { createFileRoute } from "@tanstack/react-router";
import { SavedScreen } from "../screens/profile-screens";

export const Route = createFileRoute("/saved")({
  head: () => ({ meta: [{ title: "Saved · RISK" }] }),
  component: SavedScreen,
});
