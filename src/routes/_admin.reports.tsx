import { createFileRoute } from "@tanstack/react-router";
import { useTable } from "@/hooks/useTable";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, Badge } from "@/components/DataTable";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Check } from "lucide-react";

export const Route = createFileRoute("/_admin/reports")({ component: Reports });

function Reports() {
  const { data, isLoading } = useTable<any>("reports", {
    order: { column: "created_at" },
  });
  const qc = useQueryClient();
  const resolve = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("reports")
        .update({ resolved: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["table", "reports"] });
      toast.success("Report resolved.");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader
        eyebrow="Moderation"
        title="Reports & oversight"
        description="Maintain a safe voyage for every traveler."
      />
      <DataTable
        rows={data}
        loading={isLoading}
        columns={[
          {
            key: "reason",
            label: "Reason",
            render: (r: any) => <span className="font-medium">{r.reason}</span>,
          },
          {
            key: "session_id",
            label: "Session",
            render: (r: any) => (
              <code className="text-xs text-gold">
                {r.session_id?.slice(0, 8)}
              </code>
            ),
          },
          {
            key: "user_id",
            label: "User",
            render: (r: any) => (
              <code className="text-xs">{r.user_id?.slice(0, 8)}</code>
            ),
          },
          {
            key: "created_at",
            label: "Filed",
            render: (r: any) =>
              r.created_at ? new Date(r.created_at).toLocaleString() : "—",
          },
          {
            key: "resolved",
            label: "Status",
            render: (r: any) =>
              r.resolved ? (
                <Badge tone="success">resolved</Badge>
              ) : (
                <Badge tone="danger">open</Badge>
              ),
          },
          {
            key: "act",
            label: "",
            render: (r: any) =>
              !r.resolved && (
                <button
                  onClick={() => resolve.mutate(r.id)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-success/15 text-[oklch(0.78_0.14_175)] hover:bg-success/25 transition inline-flex items-center gap-1"
                >
                  <Check className="size-3" />
                  Resolve
                </button>
              ),
            className: "text-right",
          },
        ]}
        empty="The seas are calm — no open reports."
      />
    </div>
  );
}
