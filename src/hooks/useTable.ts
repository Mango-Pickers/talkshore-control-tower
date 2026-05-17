import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useTable<T = Record<string, unknown>>(
  table: string,
  opts?: {
    select?: string;
    order?: { column: string; ascending?: boolean };
    limit?: number;
  }
) {
  return useQuery({
    queryKey: ["table", table, opts],
    queryFn: async (): Promise<T[]> => {
      let q = supabase.from(table).select(opts?.select ?? "*");
      if (opts?.order)
        q = q.order(opts.order.column, {
          ascending: opts.order.ascending ?? false,
        });
      if (opts?.limit) q = q.limit(opts.limit);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as T[];
    },
  });
}

export function useCount(
  table: string,
  filter?: (q: ReturnType<typeof supabase.from>) => unknown
) {
  return useQuery({
    queryKey: ["count", table, filter?.toString()],
    queryFn: async () => {
      let q: any = supabase
        .from(table)
        .select("*", { count: "exact", head: true });
      if (filter) q = filter(q);
      const { count, error } = await q;
      if (error) throw error;
      return count ?? 0;
    },
  });
}
