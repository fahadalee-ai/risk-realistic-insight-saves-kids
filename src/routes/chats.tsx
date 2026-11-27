import { createFileRoute } from "@tanstack/react-router";
import { ChatListScreen } from "../screens/chat-screens";

export const Route = createFileRoute("/chats")({
  head: () => ({ meta: [{ title: "Chat · RISK" }] }),
  component: ChatListScreen,
});
