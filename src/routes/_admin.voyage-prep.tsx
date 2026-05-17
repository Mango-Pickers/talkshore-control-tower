import { createFileRoute } from "@tanstack/react-router";
import { useTable } from "@/hooks/useTable";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, Badge } from "@/components/DataTable";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/voyage-prep")({ component: VoyagePrep });

function VoyagePrep() {
  const { data, isLoading } = useTable<any>("lessons", { order: { column: "order_index", ascending: true } });
  const qc = useQueryClient();
  const togglePub = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const { error } = await supabase.from("lessons").update({ published }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["table", "lessons"] }); toast.success("Lesson updated."); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader eyebrow="Curriculum" title="Voyage Prep" description="Lessons that prepare learners before they sail." />
      <DataTable
        rows={data} loading={isLoading}
        columns={[
          { key: "title", label: "Lesson", render: (l: any) => (
            <div>
              <div className="font-medium">{l.title}</div>
              <div className="text-xs text-muted-foreground line-clamp-1">{l.description}</div>
            </div>
          )},
          { key: "duration", label: "Duration", render: (l: any) => l.duration ?? "—" },
          { key: "status", label: "Status", render: (l: any) => l.published ? <Badge tone="success">published</Badge> : <Badge tone="muted">draft</Badge> },
          { key: "act", label: "", render: (l: any) => (
            <button onClick={() => togglePub.mutate({ id: l.id, published: !l.published })}
              className="text-xs px-3 py-1.5 rounded-lg bg-gold/15 text-gold hover:bg-gold/25 transition">
              {l.published ? "Unpublish" : "Publish"}
            </button>
          ), className: "text-right" },
        ]}
      />
    </div>
  );
}
