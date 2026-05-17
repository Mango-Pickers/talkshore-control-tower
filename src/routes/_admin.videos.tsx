import { createFileRoute } from "@tanstack/react-router";
import { useTable } from "@/hooks/useTable";
import { PageHeader } from "@/components/PageHeader";
import { motion } from "framer-motion";
import { Loader2, Video } from "lucide-react";

export const Route = createFileRoute("/_admin/videos")({ component: Videos });

function Videos() {
  const { data, isLoading } = useTable<any>("videos", {
    order: { column: "id" },
  });
  return (
    <div>
      <PageHeader
        eyebrow="Media"
        title="Video library"
        description="Every clip powering Voyage Prep and Live Shores."
      />
      {isLoading ? (
        <div className="ts-card p-10 grid place-items-center">
          <Loader2 className="size-5 animate-spin text-gold" />
        </div>
      ) : data?.length === 0 ? (
        <div className="ts-card p-10 text-center text-sm text-muted-foreground">
          No videos uploaded yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data ?? []).map((v: any, i: number) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="ts-card overflow-hidden group"
            >
              <div className="aspect-video bg-elevated relative overflow-hidden">
                {v.thumbnail_url ? (
                  <img
                    src={v.thumbnail_url}
                    alt={v.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                ) : (
                  <div className="w-full h-full grid place-items-center text-muted-foreground">
                    <Video className="size-8" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="font-medium truncate">
                  {v.title ?? "Untitled"}
                </div>
                <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {v.description}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
