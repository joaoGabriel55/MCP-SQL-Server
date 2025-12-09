import { useState } from "react";
import { useMcp } from "use-mcp/react";

export interface ChatResponse {
  sql: string;
  result: unknown[];
}

export function useMcpSql() {
  const [isLoading, setIsLoading] = useState(false);

  const { state, retry, error, callTool } = useMcp({
    url: "http://localhost:3002/mcp",
    clientName: "MCP-SQL-Chat",
    autoReconnect: true,
  });

  const isError = state === "failed";

  const call = async (question: string) => {
    setIsLoading(true);
    try {
      const result = await callTool("sql-query-tool", { question });

      return result.structuredContent as ChatResponse;
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  console.log({ isLoading, state });

  return {
    retry,
    isError,
    isLoading,
    error,
    call,
  };
}
