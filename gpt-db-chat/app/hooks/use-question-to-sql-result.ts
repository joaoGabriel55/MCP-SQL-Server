import { useState } from "react";

export interface ChatResponse {
  sql: string;
  result: unknown[];
}

async function makeRequest(body: Record<string, any>) {
  const response = await fetch("http://localhost:3002/question-sql-result", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return await response.json();
}

export function useQuestionToSqlResult() {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const call = async (question: string) => {
    setIsLoading(true);
    try {
      const result = await makeRequest({ question });

      return result as ChatResponse;
    } catch (error) {
      console.error(error);
      setIsError(true);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, isError, call };
}
