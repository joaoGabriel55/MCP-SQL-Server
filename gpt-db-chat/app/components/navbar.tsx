import { useEffect, useState } from "react";

export function Navbar() {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const storedHistory = localStorage.getItem("history");
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  }, []);

  return (
    <nav className="w-full h-full px-8 border-r-1">
      <h2 className="text-xl font-bold">History</h2>

      <ul className="mt-8 overflow-y-scroll">
        {history.map((item, index) => (
          <li key={index}>
            <a href={`?question=${item}`} className="p-2 block rounded mb-2 hover:transition transition">{item}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
