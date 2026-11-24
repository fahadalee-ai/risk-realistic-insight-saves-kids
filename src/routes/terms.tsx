import { createFileRoute } from "@tanstack/react-router";
import { LegalScreen } from "../screens/info-screens";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms · RISK" }] }),
  component: function TermsPage() {
    return <LegalScreen kind="terms" />;
  },
});
