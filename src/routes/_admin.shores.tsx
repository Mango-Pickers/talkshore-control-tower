import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, Badge } from "@/components/DataTable";

export const Route = createFileRoute("/_admin/shores")({ component: Shores });

const tabs = [
  { key: "live", label: "Live" },
  { key: "scheduled", label: "Upcoming" },
  { key: "completed", label: "Completed" },
] as const;

function Shores() {
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>("live");
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["sessions", tab],
    queryFn: async () => {
      const { data } = await supabase
        .from("sessions")
        .select("*")
        .eq("status", tab)
        .order("starts_at", { ascending: tab !== "completed" });
      return data ?? [];
    },
  });

  // realtime
  useEffect(() => {
    const ch = supabase
      .channel("sessions-rt")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sessions" },
        () => qc.invalidateQueries({ queryKey: ["sessions"] })
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [qc]);

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Shores control center"
        description="Live voyage sessions, scheduling, and oversight."
      />
      <div className="flex gap-2 mb-5">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm transition ${tab === t.key ? "bg-gold text-[oklch(0.18_0.04_255)] font-medium" : "bg-elevated text-muted-foreground hover:text-foreground"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <DataTable
        rows={data}
        loading={isLoading}
        columns={[
          {
            key: "id",
            label: "Session",
            render: (s: any) => (
              <code className="text-xs text-gold">{s.id.slice(0, 8)}</code>
            ),
          },
          {
            key: "level",
            label: "Level",
            render: (s: any) => <Badge tone="muted">{s.level ?? "—"}</Badge>,
          },
          {
            key: "participants",
            label: "Participants",
            render: (s: any) =>
              `${s.participants ?? 0} / ${s.max_participants ?? "∞"}`,
          },
          {
            key: "starts_at",
            label: "Starts",
            render: (s: any) =>
              s.starts_at ? new Date(s.starts_at).toLocaleString() : "—",
          },
          {
            key: "status",
            label: "Status",
            render: (s: any) => (
              <Badge
                tone={
                  s.status === "live"
                    ? "success"
                    : s.status === "scheduled"
                      ? "gold"
                      : "muted"
                }
              >
                {s.status}
              </Badge>
            ),
          },
        ]}
        empty={`No ${tab} shores.`}
      />
    </div>
  );
}
