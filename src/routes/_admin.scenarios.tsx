import { createFileRoute } from "@tanstack/react-router";
import { useTable } from "@/hooks/useTable";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, Badge } from "@/components/DataTable";

export const Route = createFileRoute("/_admin/scenarios")({
  component: Scenarios,
});

function Scenarios() {
  const { data, isLoading } = useTable<any>("scenarios", {
    order: { column: "title", ascending: true },
  });
  return (
    <div>
      <PageHeader
        eyebrow="Library"
        title="Scenarios"
        description="Topical conversation arcs across cultures."
      />
      <DataTable
        rows={data}
        loading={isLoading}
        columns={[
          {
            key: "title",
            label: "Title",
            render: (s: any) => <span className="font-medium">{s.title}</span>,
          },
          {
            key: "description",
            label: "Description",
            render: (s: any) => (
              <span className="text-muted-foreground line-clamp-1">
                {s.description}
              </span>
            ),
          },
          {
            key: "difficulty",
            label: "Difficulty",
            render: (s: any) => (
              <Badge tone="gold">{s.difficulty ?? "—"}</Badge>
            ),
          },
        ]}
      />
    </div>
  );
}
