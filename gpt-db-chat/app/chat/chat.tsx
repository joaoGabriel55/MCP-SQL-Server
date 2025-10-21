import { useEffect, useState } from "react";
import { useFetcher, useSearchParams } from "react-router";
import { Table } from "~/components/table";

export function Chat() {
  const fetcher = useFetcher();
  const [searchParams] = useSearchParams();

  const [questionInput, setQuestionInput] = useState(
    searchParams.get("question") || "",
  );

  const busy = fetcher.state !== "idle";

  const { sql, result } = fetcher.data || {};

  useEffect(() => {
    if (fetcher.formData) {
      const question = fetcher.formData.get("question") as string;

      const currentHistory = localStorage.getItem("history")
        ? JSON.parse(localStorage.getItem("history")!)
        : [];

      // Update history with the new question if it's not already present
      if (!currentHistory.includes(question)) {
        const updatedHistory = [question, ...currentHistory];
        localStorage.setItem("history", JSON.stringify(updatedHistory));
      }
    }
  }, [fetcher.formData]);

  useEffect(() => {
    if (searchParams.size > 0) {
      console.log("Search params changed:", searchParams.toString());

      const question = searchParams.get("question");
      if (question) {
        fetcher.submit({ question }, { method: "post" });
      }
    }
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
      <header className="flex flex-col items-center gap-9">
        <h1 className="text-3xl font-bold">GPTo Database Chat</h1>
      </header>
      <div className="w-1/2 space-y-6 px-4">
        <fetcher.Form className="flex w-full gap-2" method="post">
          <input
            type="text"
            name="question"
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            className="border-1 p-2 w-full"
          />
          <button
            className="border-1 p-2 w-[128px] bg-amber-900 cursor-pointer"
            type="submit"
            disabled={busy}
          >
            {busy ? "Sending..." : "Send"}
          </button>
        </fetcher.Form>
      </div>
      {sql ? <code className="border-1 p-4">{sql}</code> : null}
      {result ? <Table rows={result} /> : null}
    </div>
  );
}
