export async function mcpApiAsk(params: { question: string }) {
  const response = await fetch("http://localhost:3001/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ method: "ask", params }),
  });

  const data = await response.json();

  return data as { sql: string; result: unknown[] };
}
