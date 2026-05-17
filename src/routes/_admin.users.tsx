import { createFileRoute } from "@tanstack/react-router";
import { useTable } from "@/hooks/useTable";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, Badge } from "@/components/DataTable";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Ban } from "lucide-react";

export const Route = createFileRoute("/_admin/users")({ component: Users });

function Users() {
  const { data, isLoading } = useTable<any>("profiles", { order: { column: "created_at" } });
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Record<string, unknown> }) => {
      const { error } = await supabase.from("profiles").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["table", "profiles"] }); toast.success("Updated."); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader eyebrow="Roster" title="User management" description="Every traveler aboard TalkShore." />
      <DataTable
        rows={data} loading={isLoading}
        columns={[
          { key: "full_name", label: "Name", render: (u: any) => (
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-elevated grid place-items-center">{(u.full_name ?? "?").slice(0,1).toUpperCase()}</div>
              <span className="font-medium">{u.full_name ?? "—"}</span>
            </div>
          )},
          { key: "role", label: "Role", render: (u: any) => <Badge tone={u.role === "guide" ? "gold" : "muted"}>{u.role ?? "learner"}</Badge> },
          { key: "created_at", label: "Joined", render: (u: any) => u.created_at ? new Date(u.created_at).toLocaleDateString() : "—" },
          { key: "status", label: "Status", render: (u: any) => u.banned ? <Badge tone="danger">banned</Badge> : <Badge tone="success">active</Badge> },
          { key: "act", label: "", render: (u: any) => (
            <button onClick={() => mut.mutate({ id: u.id, patch: { banned: !u.banned } })}
              className="text-xs px-3 py-1.5 rounded-lg bg-destructive/15 text-destructive hover:bg-destructive/25 transition inline-flex items-center gap-1">
              <Ban className="size-3" />{u.banned ? "Unban" : "Suspend"}
            </button>
          ), className: "text-right" },
        ]}
      />
    </div>
  );
}
