import { createFileRoute } from "@tanstack/react-router";
import { ChatThreadScreen } from "../screens/chat-screens";

export const Route = createFileRoute("/chat/$appointmentId")({
  head: () => ({ meta: [{ title: "Chat · RISK" }] }),
  component: function ChatPage() {
    const { appointmentId } = Route.useParams();
    return <ChatThreadScreen appointmentId={appointmentId} />;
  },
});
