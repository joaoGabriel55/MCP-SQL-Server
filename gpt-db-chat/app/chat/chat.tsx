import { useLocalStorage } from "@uidotdev/usehooks";
import { useEffect, useState } from "react";
import { Form, useSearchParams } from "react-router";
import { Table } from "~/components/table";
import { useMcpSql, type ChatResponse } from "~/hooks/use-mcp-sql";

export function Chat() {
  const [searchParams] = useSearchParams();
  const [chatHistory, saveChatHistory] = useLocalStorage<string[]>(
    "history",
    [],
  );

  const [questionInput, setQuestionInput] = useState(
    searchParams.get("question") || "",
  );
  const [chatResponse, setChatResponse] = useState<ChatResponse | null>(null);

  const { isError, isLoading, retry, error, call } = useMcpSql();

  useEffect(() => {
    async function fetchChatResponse() {
      const question = searchParams.get("question");

      if (question) {
        const result = await call(question);

        setChatResponse(result);
      }
    }

    if (searchParams.size > 0) {
      fetchChatResponse();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const question = questionInput.trim();

    if (!question) return;

    const result = await call(question);

    setChatResponse(result);

    if (!chatHistory.includes(question)) {
      const updatedHistory = [question, ...chatHistory];
      saveChatHistory(updatedHistory);
    }
  };

  return (
    <div className="container-fluid flex flex-col bg-background">
      {/* Header Section */}
      <header className="py-8 text-center border-b border-border animate-fade-in">
        <h1 className="h1 text-foreground">GPTo Database Chat</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Ask questions about your database in natural language
        </p>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col px-4 md:px-0 max-w-3xl mx-auto w-full py-8 gap-8">
        {/* Question Input Section */}
        <section className="w-full animate-fade-in">
          <Form
            onSubmit={handleSubmit}
            className="flex flex-col md:flex-row gap-3"
          >
            <input
              type="text"
              name="question"
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              placeholder="Ask a question about your database..."
              className="input-base flex-1"
              disabled={isError}
            />
            <button
              type="submit"
              disabled={isError || !questionInput.trim()}
              className={`button-base button-primary px-6 py-2 ${
                isError ? "opacity-50" : ""
              }`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </span>
              ) : (
                "Ask Question"
              )}
            </button>
          </Form>
        </section>

        {/* Results Section */}
        {isError ? (
          <div>
            <p>Connection failed: {error}</p>
            <button onClick={retry}>Retry</button>
          </div>
        ) : null}

        {chatResponse && (
          <section className="space-y-6 animate-fade-in">
            {/* SQL Query Display */}
            {chatResponse.sql && (
              <div className="space-y-2">
                <h3 className="h4 text-foreground">Generated SQL Query:</h3>
                <div className="code-block overflow-x-auto">
                  <pre className="whitespace-pre-wrap">{chatResponse.sql}</pre>
                </div>
              </div>
            )}

            {/* Results Table */}
            {chatResponse.result && (
              <div className="space-y-2">
                <h3 className="h4 text-foreground">Query Results:</h3>
                <div className="table-wrapper">
                  <Table rows={chatResponse.result} />
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
