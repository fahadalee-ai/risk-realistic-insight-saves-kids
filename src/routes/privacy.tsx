import { createFileRoute } from "@tanstack/react-router";
import { LegalScreen } from "../screens/info-screens";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy · RISK" }] }),
  component: function PrivacyPage() {
    return <LegalScreen kind="privacy" />;
  },
});
