import { createFileRoute } from "@tanstack/react-router";
import { ServiceDetailScreen } from "../screens/service-screens";

export const Route = createFileRoute("/service/$serviceId")({
  head: () => ({ meta: [{ title: "Service · RISK" }] }),
  component: function ServicePage() {
    const { serviceId } = Route.useParams();
    return <ServiceDetailScreen serviceId={serviceId} />;
  },
});
