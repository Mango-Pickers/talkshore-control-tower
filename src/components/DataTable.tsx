import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

export function DataTable<T extends { id: string | number }>({
  rows,
  loading,
  columns,
  empty = "No records yet.",
}: {
  rows: T[] | undefined;
  loading: boolean;
  columns: {
    key: string;
    label: string;
    render?: (row: T) => ReactNode;
    className?: string;
  }[];
  empty?: string;
}) {
  if (loading) {
    return (
      <div className="ts-card p-10 grid place-items-center">
        <Loader2 className="size-5 animate-spin text-gold" />
      </div>
    );
  }
  if (!rows || rows.length === 0) {
    return (
      <div className="ts-card p-10 text-center text-sm text-muted-foreground">
        {empty}
      </div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="ts-card overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-elevated/60">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={`text-left font-medium text-xs uppercase tracking-wider text-muted-foreground px-5 py-3 ${c.className ?? ""}`}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-t border-border hover:bg-elevated/40 transition"
              >
                {columns.map((c) => (
                  <td key={c.key} className={`px-5 py-4 ${c.className ?? ""}`}>
                    {c.render ? c.render(row) : ((row as any)[c.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

export function Badge({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "gold" | "success" | "danger" | "muted";
}) {
  const tones: Record<string, string> = {
    default: "bg-elevated text-foreground",
    gold: "bg-gold/15 text-gold border border-gold/30",
    success:
      "bg-[color:oklch(0.78_0.14_175)]/15 text-[oklch(0.78_0.14_175)] border border-[color:oklch(0.78_0.14_175)]/30",
    danger: "bg-destructive/15 text-destructive border border-destructive/30",
    muted: "bg-card text-muted-foreground border border-border",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] uppercase tracking-wider ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
