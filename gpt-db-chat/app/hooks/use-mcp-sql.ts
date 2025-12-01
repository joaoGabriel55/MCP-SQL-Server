import { useMcp } from "use-mcp/react";

export interface ChatResponse {
  sql: string;
  result: unknown[];
}

export function useMcpSql() {
  const { state, retry, error, callTool } = useMcp({
    url: "http://localhost:3001/mcp",
    clientName: "MCP-SQL-Chat",
    autoReconnect: true,
  });

  const isError = state === "failed";
  const isLoading = state === "loading";

  const call = async (question: string) => {
    try {
      const result = await callTool("sql-query-tool", { question });

      return result.structuredContent as ChatResponse;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return {
    retry,
    isError,
    isLoading,
    error,
    call,
  };
}
