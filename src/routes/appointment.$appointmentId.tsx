import { createFileRoute } from "@tanstack/react-router";
import { AppointmentDetailScreen } from "../screens/profile-screens";

export const Route = createFileRoute("/appointment/$appointmentId")({
  head: () => ({ meta: [{ title: "Appointment · RISK" }] }),
  component: function AppointmentPage() {
    const { appointmentId } = Route.useParams();
    return <AppointmentDetailScreen appointmentId={appointmentId} />;
  },
});
