import React from "react";
import { motion } from "framer-motion";

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

const rowVariants: any = {
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
      className={`w-full overflow-x-auto rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white/80 dark:bg-[#0E1524]/80 backdrop-blur-md shadow-xs ${className}`}
    >
      <table className="w-full text-left border-collapse text-xs select-none">
        {/* Sticky Header */}
        <thead className="sticky top-0 z-10 bg-slate-50/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider text-[11px]">
          <tr>
            {columns.map((col, idx) => {
              const key = col.id || (col.accessorKey as string) || `col-${idx}`;
              return (
                <th
                  key={key}
                  scope="col"
                  className="px-5 py-3.5 font-semibold whitespace-nowrap"
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
          className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200"
        >
          {!data.length ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-5 py-8 text-center text-slate-400 font-mono text-xs"
              >
                No telemetry records available.
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
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors duration-150"
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
                        className="px-5 py-3.5 text-xs leading-relaxed"
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
