import React from "react";
import { motion } from "framer-motion";

export interface ColumnDef<T> {
  id?: string;
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  /** Array of data records */
  data: T[];
  /** Column definitions */
  columns: ColumnDef<T>[];
  /** Optional custom container CSS classes */
  className?: string;
}

// Framer Motion Animation Variants for Table Rows
const tableContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.02,
    },
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: "easeOut" },
  },
};

export function DataTable<T extends Record<string, unknown>>({
  data = [],
  columns = [],
  className = "",
}: DataTableProps<T>): React.ReactElement {
  return (
    <div
      className={`w-full overflow-x-auto rounded-xl border border-[#30363D] bg-[#161B22] shadow-lg ${className}`}
    >
      <table className="w-full text-left border-collapse text-xs select-none">
        {/* Sticky Header */}
        <thead className="sticky top-0 z-10 bg-[#0D1117] border-b border-[#30363D] text-[#9CA3AF] font-mono uppercase tracking-wider text-[11px]">
          <tr>
            {columns.map((col, idx) => {
              const key = col.id || (col.accessorKey as string) || `col-${idx}`;
              return (
                <th
                  key={key}
                  scope="col"
                  className="px-4 py-3 font-semibold whitespace-nowrap"
                >
                  {col.header}
                </th>
              );
            })}
          </tr>
        </thead>

        {/* Table Body */}
        <motion.tbody
          variants={tableContainerVariants}
          initial="hidden"
          animate="visible"
          className="divide-y divide-[#30363D]/50 text-gray-200"
        >
          {!data.length ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-gray-400 font-mono text-xs"
              >
                No data available.
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => {
              const rowKey =
                "id" in row && row.id ? String(row.id) : `row-${rowIndex}`;

              return (
                <motion.tr
                  key={rowKey}
                  variants={rowVariants}
                  className="even:bg-[#0D1117]/30 hover:bg-[#21262D]/60 transition-colors duration-150"
                >
                  {columns.map((col, colIndex) => {
                    const cellKey =
                      col.id || (col.accessorKey as string) || `cell-${colIndex}`;

                    let cellValue: React.ReactNode = null;
                    if (col.cell) {
                      cellValue = col.cell(row);
                    } else if (col.accessorKey) {
                      cellValue = row[col.accessorKey] as React.ReactNode;
                    }

                    return (
                      <td
                        key={cellKey}
                        className="px-4 py-3 text-xs leading-relaxed"
                      >
                        {cellValue}
                      </td>
                    );
                  })}
                </motion.tr>
              );
            })
          )}
        </motion.tbody>
      </table>
    </div>
  );
}

export default DataTable;