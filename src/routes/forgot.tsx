import { createFileRoute } from "@tanstack/react-router";
import { ForgotScreen } from "../screens/auth-screens";

export const Route = createFileRoute("/forgot")({
  validateSearch: (search: Record<string, unknown>) => {
    const step = Number(search.step);
    return { step: step === 2 || step === 3 ? step : 1 };
  },
  head: () => ({ meta: [{ title: "Forgot Password · RISK" }] }),
  component: function ForgotPage() {
    const { step } = Route.useSearch();
    return <ForgotScreen step={step} />;
  },
});
