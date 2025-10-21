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
      <h2 className="text-white text-xl font-bold">History</h2>

      <ul className="mt-8">
        {history.map((item, index) => (
          <li key={index} className="text-gray-300">
            <a
              href={`?question=${item}`}
              className="hover:bg-gray-900 p-2 block rounded mb-2 hover:transition transition"
            >
              {item}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
