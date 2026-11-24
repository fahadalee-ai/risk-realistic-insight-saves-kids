import { createFileRoute } from "@tanstack/react-router";
import { AppointmentsScreen } from "../screens/profile-screens";

export const Route = createFileRoute("/appointments")({
  head: () => ({ meta: [{ title: "Appointments · RISK" }] }),
  component: AppointmentsScreen,
});
