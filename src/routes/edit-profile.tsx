import { createFileRoute } from "@tanstack/react-router";
import { EditProfileScreen } from "../screens/profile-screens";

export const Route = createFileRoute("/edit-profile")({
  head: () => ({ meta: [{ title: "Edit Profile · RISK" }] }),
  component: EditProfileScreen,
});
