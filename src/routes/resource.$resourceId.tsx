import { createFileRoute } from "@tanstack/react-router";
import { ResourceDetailScreen } from "../screens/resource-screens";

export const Route = createFileRoute("/resource/$resourceId")({
  head: () => ({ meta: [{ title: "Resource · RISK" }] }),
  component: function ResourcePage() {
    const { resourceId } = Route.useParams();
    return <ResourceDetailScreen resourceId={resourceId} />;
  },
});
