import { useLocalStorage } from "@uidotdev/usehooks";

export function Navbar() {
  const [chatHistory] = useLocalStorage<string[]>("history", []);

  return (
    <nav className="w-full h-full px-8 border-r">
      <h2 className="text-xl font-bold">History</h2>

      <ul className="mt-8 overflow-y-scroll">
        {chatHistory.map((item, index) => (
          <li key={index}>
            <a
              href={`?question=${item}`}
              className="p-2 block rounded mb-2 hover:transition transition"
            >
              {item}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
