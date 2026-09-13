import { useQuery } from "@tanstack/react-query";
import {
  countDocuments,
  listDocuments,
  type FirestoreFilter,
} from "@/lib/firestore";

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
      return listDocuments<T>(table, {
        order: opts?.order
          ? {
              field: opts.order.column,
              direction: opts.order.ascending ? "asc" : "desc",
            }
          : undefined,
        limit: opts?.limit,
      });
    },
  });
}

export function useCount(table: string, filter?: FirestoreFilter) {
  return useQuery({
    queryKey: ["count", table, filter],
    queryFn: () => countDocuments(table, filter),
  });
}
