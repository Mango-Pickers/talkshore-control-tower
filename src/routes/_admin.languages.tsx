import { createFileRoute } from "@tanstack/react-router";
import { useTable } from "@/hooks/useTable";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, Badge } from "@/components/DataTable";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/languages")({
  component: Languages,
});

function Languages() {
  const { data, isLoading } = useTable<any>("languages", {
    order: { column: "name", ascending: true },
  });
  const qc = useQueryClient();

  const upsert = useMutation({
    mutationFn: async (payload: {
      code: string;
      name: string;
      flag?: string;
    }) => {
      const { error } = await supabase
        .from("languages")
        .insert({ ...payload, active: true });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["table", "languages"] });
      toast.success("Language added.");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from("languages")
        .update({ active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["table", "languages"] }),
  });

  return (
    <div>
      <PageHeader
        eyebrow="Atlas"
        title="Languages"
        description="Curate the tongues spoken across the voyage."
        actions={
          <button
            onClick={() => {
              const code = prompt("Language code (e.g. fr)");
              const name = prompt("Language name (e.g. French)");
              const flag = prompt("Flag emoji (optional)") ?? "";
              if (code && name) upsert.mutate({ code, name, flag });
            }}
            className="px-4 py-2 rounded-xl bg-gold text-[oklch(0.18_0.04_255)] font-medium text-sm hover:brightness-110"
          >
            + Add language
          </button>
        }
      />
      <DataTable
        rows={data}
        loading={isLoading}
        columns={[
          {
            key: "flag",
            label: "",
            render: (l: any) => (
              <span className="text-2xl">{l.flag ?? "🏳"}</span>
            ),
            className: "w-12",
          },
          {
            key: "name",
            label: "Name",
            render: (l: any) => <span className="font-medium">{l.name}</span>,
          },
          {
            key: "code",
            label: "Code",
            render: (l: any) => <code className="text-gold">{l.code}</code>,
          },
          {
            key: "active",
            label: "Status",
            render: (l: any) =>
              l.active ? (
                <Badge tone="success">active</Badge>
              ) : (
                <Badge tone="muted">inactive</Badge>
              ),
          },
          {
            key: "act",
            label: "",
            render: (l: any) => (
              <button
                onClick={() => toggle.mutate({ id: l.id, active: !l.active })}
                className="text-xs px-3 py-1.5 rounded-lg bg-elevated hover:bg-card transition"
              >
                {l.active ? "Deactivate" : "Activate"}
              </button>
            ),
            className: "text-right",
          },
        ]}
      />
    </div>
  );
}
