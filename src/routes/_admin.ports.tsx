import { createFileRoute } from "@tanstack/react-router";
import { useTable } from "@/hooks/useTable";
import { PageHeader } from "@/components/PageHeader";
import { motion } from "framer-motion";
import { Loader2, MapPin } from "lucide-react";

export const Route = createFileRoute("/_admin/ports")({ component: Ports });

function Ports() {
  const { data, isLoading } = useTable<any>("ports_of_call", { order: { column: "title", ascending: true } });
  return (
    <div>
      <PageHeader eyebrow="Atlas" title="Ports of Call" description="Curated destinations that anchor each cultural voyage." />
      {isLoading ? (
        <div className="ts-card p-10 grid place-items-center"><Loader2 className="size-5 animate-spin text-gold" /></div>
      ) : data?.length === 0 ? (
        <div className="ts-card p-10 text-center text-sm text-muted-foreground">No ports added yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data ?? []).map((p: any, i: number) => (
            <motion.div key={p.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="ts-card overflow-hidden group">
              <div className="aspect-[16/10] bg-elevated relative overflow-hidden">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                ) : (
                  <div className="w-full h-full grid place-items-center text-muted-foreground"><MapPin className="size-8" /></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-card/95 via-card/30 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <div className="font-display text-xl">{p.title}</div>
                  <div className="text-xs text-gold uppercase tracking-wider">{p.country}</div>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
