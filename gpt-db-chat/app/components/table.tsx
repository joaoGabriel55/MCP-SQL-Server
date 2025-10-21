import { ViewTransition } from "react";

export function Table({ rows }: { rows: unknown[] }) {
  return (
    <ViewTransition>
      <table>
        <thead>
          <tr>
            {rows.length > 0 &&
              Object.keys(rows[0] as Record<string, unknown>).map((key) => (
                <th key={key} className="border px-4 py-2">
                  {key}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {Object.values(row as Record<string, unknown>).map(
                (value, cellIndex) => (
                  <td key={cellIndex} className="border px-4 py-2">
                    {String(value)}
                  </td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </ViewTransition>
  );
}
