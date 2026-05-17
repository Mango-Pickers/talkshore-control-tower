import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { useCount } from "@/hooks/useTable";
import { motion } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_admin/analytics")({ component: Analytics });

function Analytics() {
  const learners = useCount("profiles");
  const sessions = useCount("sessions");
  const videos = useCount("videos");
  const lessons = useCount("lessons");

  const chart = Array.from({ length: 14 }).map((_, i) => ({
    day: `D${i + 1}`,
    engagement: Math.round(40 + Math.sin(i / 2) * 18 + i * 2),
    retention: Math.round(60 + Math.cos(i / 3) * 12),
  }));

  return (
    <div>
      <PageHeader eyebrow="Insights" title="Platform analytics" description="Where the voyage thrives, and where it drifts." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Profiles", value: learners.data },
          { label: "Sessions", value: sessions.data },
          { label: "Videos", value: videos.data },
          { label: "Lessons", value: lessons.data },
        ].map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="ts-card p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
            <div className="font-display text-3xl mt-2">{s.value ?? "—"}</div>
          </motion.div>
        ))}
      </div>

      <div className="ts-card p-6">
        <h3 className="font-display text-xl mb-1">Engagement vs Retention</h3>
        <p className="text-xs text-muted-foreground mb-4">14-day rolling view</p>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chart}>
              <defs>
                <linearGradient id="a1" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.78 0.13 75)" stopOpacity={0.5} /><stop offset="100%" stopColor="oklch(0.78 0.13 75)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="a2" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.78 0.14 175)" stopOpacity={0.5} /><stop offset="100%" stopColor="oklch(0.78 0.14 175)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 6%)" />
              <XAxis dataKey="day" stroke="oklch(0.72 0.04 250)" fontSize={11} />
              <YAxis stroke="oklch(0.72 0.04 250)" fontSize={11} />
              <Tooltip contentStyle={{ background: "oklch(0.27 0.055 260)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: 12 }} />
              <Area dataKey="engagement" stroke="oklch(0.83 0.13 78)" fill="url(#a1)" strokeWidth={2} />
              <Area dataKey="retention" stroke="oklch(0.78 0.14 175)" fill="url(#a2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
