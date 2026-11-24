import { createFileRoute } from "@tanstack/react-router";
import { BookScreen } from "../screens/book-screen";

export const Route = createFileRoute("/book")({
  validateSearch: (search: Record<string, unknown>) => {
    const step = Number(search.step ?? 1);
    return { step: step >= 1 && step <= 6 ? step : 1 };
  },
  head: () => ({ meta: [{ title: "Book · RISK" }] }),
  component: function BookPage() {
    const { step } = Route.useSearch();
    return <BookScreen step={step} />;
  },
});
