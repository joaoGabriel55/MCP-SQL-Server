import { Navbar } from "~/components/navbar";
import { Chat } from "../chat/chat";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "GPTo Database Chat" },
    { name: "description", content: "Know more about your database" },
  ];
}

export default function Home() {
  return (
    <main className="grid grid-cols-[1fr_3fr] h-full pt-16 pb-4">
      <Navbar />
      <Chat />
    </main>
  );
}
