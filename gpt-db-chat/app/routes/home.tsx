import type { Route } from "./+types/home";
import { Chat } from "../chat/chat";
import { mcpApiAsk } from "~/infra/api/mcp-api";
import { Navbar } from "~/components/navbar";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "GPTo Database Chat" },
    { name: "description", content: "Know more about your database" },
  ];
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const question = formData.get("question") as string;

  const response = await mcpApiAsk({ question });

  return response;
}

export default function Home() {
  return (
    <main className="grid grid-cols-[1fr_3fr] h-full pt-16 pb-4">
      <Navbar />
      <Chat />
    </main>
  );
}
