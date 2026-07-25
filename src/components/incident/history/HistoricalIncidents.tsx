import React from "react";

export interface ColumnDef<T> {
  id?: string;
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  className?: string;
}

export function DataTable<T extends object>({
  data,
  columns,
  className = "",
}: DataTableProps<T>) {
  return (
    <div className={`w-full overflow-x-auto border border-[#30363D] rounded-xl ${className}`}>
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="bg-[#161B22] border-b border-[#30363D] text-[#8B949E] text-xs font-semibold">
            {columns.map((col, idx) => (
              <th
                key={col.id || String(col.accessorKey) || idx}
                className="px-4 py-3"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#30363D] bg-[#0D1117]">
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="hover:bg-[#21262D]/50 transition-colors"
            >
              {columns.map((col, colIndex) => {
                const value = col.accessorKey
                  ? (row[col.accessorKey] as React.ReactNode)
                  : null;

                return (
                  <td
                    key={col.id || String(col.accessorKey) || colIndex}
                    className="px-4 py-3 align-middle"
                  >
                    {col.cell ? col.cell(row) : value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default React.memo(DataTable) as typeof DataTable;