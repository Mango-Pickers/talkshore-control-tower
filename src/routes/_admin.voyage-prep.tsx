import { createFileRoute } from "@tanstack/react-router";
import { useTable } from "@/hooks/useTable";
import { PageHeader } from "@/components/PageHeader";
import { DataTable, Badge } from "@/components/DataTable";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchDocument } from "@/lib/firestore";
import { toast } from "sonner";

interface Lesson {
  id: string;
  title: string;
  description?: string | null;
  duration?: string | number | null;
  order_index?: number;
  published: boolean;
}

interface PublishVariables {
  id: string;
  published: boolean;
  title: string;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "The lesson could not be updated.";
}

export const Route = createFileRoute("/_admin/voyage-prep")({
  component: VoyagePrep,
});

function VoyagePrep() {
  const lessons = useTable<Lesson>("lessons", {
    order: { column: "order_index", ascending: true },
  });
  const qc = useQueryClient();

  const togglePub = useMutation({
    mutationFn: async ({ id, published }: PublishVariables) => {
      await patchDocument("lessons", id, {
        published,
        updated_at: new Date().toISOString(),
      });
    },
    onSuccess: async (_, variables) => {
      await qc.invalidateQueries({ queryKey: ["table", "lessons"] });
      toast.success(
        `${variables.title} ${variables.published ? "published" : "moved to drafts"}.`
      );
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error)),
  });

  const changingLessonId = togglePub.isPending ? togglePub.variables.id : null;

  return (
    <div>
      <PageHeader
        eyebrow="Curriculum"
        title="Voyage Prep"
        description="Lessons that prepare learners before they sail."
      />
      <DataTable
        rows={lessons.data}
        loading={lessons.isLoading}
        empty={
          lessons.isError
            ? "Lessons could not be loaded. Refresh the page to try again."
            : "No Voyage Prep lessons have been created yet."
        }
        columns={[
          {
            key: "title",
            label: "Lesson",
            render: (lesson) => (
              <div>
                <div className="font-medium">{lesson.title}</div>
                <div className="text-xs text-muted-foreground line-clamp-1">
                  {lesson.description || "No description provided."}
                </div>
              </div>
            ),
          },
          {
            key: "duration",
            label: "Duration",
            render: (lesson) => lesson.duration ?? "—",
          },
          {
            key: "status",
            label: "Status",
            render: (lesson) =>
              lesson.published ? (
                <Badge tone="success">published</Badge>
              ) : (
                <Badge tone="muted">draft</Badge>
              ),
          },
          {
            key: "act",
            label: "",
            render: (lesson) => {
              const isChanging = changingLessonId === lesson.id;

              return (
                <button
                  onClick={() =>
                    togglePub.mutate({
                      id: lesson.id,
                      published: !lesson.published,
                      title: lesson.title,
                    })
                  }
                  disabled={togglePub.isPending}
                  aria-label={`${lesson.published ? "Unpublish" : "Publish"} ${lesson.title}`}
                  className="rounded-lg bg-gold/15 px-3 py-1.5 text-xs text-gold transition hover:bg-gold/25 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isChanging
                    ? "Updating…"
                    : lesson.published
                      ? "Unpublish"
                      : "Publish"}
                </button>
              );
            },
            className: "text-right",
          },
        ]}
      />
    </div>
  );
}
