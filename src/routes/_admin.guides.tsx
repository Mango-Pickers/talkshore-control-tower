import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, Badge } from "@/components/DataTable";
import { BadgeCheck, Ban, Shield } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/guides")({ component: Guides });

function Guides() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["guides"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("role", "guide").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const mut = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Record<string, unknown> }) => {
      const { error } = await supabase.from("profiles").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["guides"] });
      toast.success("Guide updated.");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader eyebrow="Crew" title="Guide management" description="Verify, suspend, or onboard guides across all languages." />
      <DataTable
        rows={data} loading={isLoading}
        columns={[
          { key: "full_name", label: "Guide", render: (g: any) => (
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-elevated grid place-items-center">{(g.full_name ?? "?").slice(0,1).toUpperCase()}</div>
              <div>
                <div className="font-medium">{g.full_name ?? "Unnamed"}</div>
                <div className="text-xs text-muted-foreground">{g.id.slice(0, 8)}</div>
              </div>
            </div>
          )},
          { key: "guide_language", label: "Language" },
          { key: "guide_days_per_week", label: "Days / wk" },
          { key: "guide_streak_years", label: "Experience (yrs)" },
          { key: "status", label: "Status", render: (g: any) => (
            <div className="flex gap-1 flex-wrap">
              {g.verified_guide ? <Badge tone="success"><BadgeCheck className="size-3" />verified</Badge> : <Badge tone="muted">unverified</Badge>}
              {g.is_guide_onboarded && <Badge tone="gold">onboarded</Badge>}
              {g.banned && <Badge tone="danger"><Ban className="size-3" />banned</Badge>}
            </div>
          )},
          { key: "actions", label: "", render: (g: any) => (
            <div className="flex gap-2 justify-end">
              <button onClick={() => mut.mutate({ id: g.id, patch: { verified_guide: !g.verified_guide } })}
                className="text-xs px-3 py-1.5 rounded-lg bg-gold/15 text-gold hover:bg-gold/25 transition flex items-center gap-1">
                <Shield className="size-3" />{g.verified_guide ? "Revoke" : "Verify"}
              </button>
              <button onClick={() => mut.mutate({ id: g.id, patch: { banned: !g.banned } })}
                className="text-xs px-3 py-1.5 rounded-lg bg-destructive/15 text-destructive hover:bg-destructive/25 transition">
                {g.banned ? "Unban" : "Ban"}
              </button>
            </div>
          ), className: "text-right" },
        ]}
      />
    </div>
  );
}
