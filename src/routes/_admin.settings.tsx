import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/_admin/settings")({
  component: Settings,
});

function Settings() {
  const { user, role } = useAuth();
  return (
    <div>
      <PageHeader
        eyebrow="Control"
        title="Settings"
        description="Tune the bridge to your operating cadence."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="ts-card p-6">
          <h3 className="font-display text-xl mb-4">Your session</h3>
          <dl className="text-sm space-y-3">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Email</dt>
              <dd>{user?.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Role</dt>
              <dd className="text-gold uppercase tracking-wider text-xs">
                {role}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">User ID</dt>
              <dd>
                <code className="text-xs">{user?.id.slice(0, 12)}…</code>
              </dd>
            </div>
          </dl>
        </div>

        <div className="ts-card p-6">
          <h3 className="font-display text-xl mb-4">Platform</h3>
          <dl className="text-sm space-y-3">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Supabase project</dt>
              <dd>
                <code className="text-xs text-gold">xgoehmaxmavvujjasmvr</code>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Storage buckets</dt>
              <dd className="text-xs">
                lesson-videos · lesson-thumbnails · guide-avatars
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Realtime</dt>
              <dd className="text-[oklch(0.78_0.14_175)]">connected</dd>
            </div>
          </dl>
        </div>

        <div className="ts-card p-6 lg:col-span-2">
          <h3 className="font-display text-xl mb-2">Feature toggles</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Reserved for upcoming experiments — live shores beta, AI scenario
            authoring, multi-region storage.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              "Live Shores Beta",
              "AI Scenario Author",
              "Multi-region Media",
            ].map((f) => (
              <div
                key={f}
                className="ts-elevated p-4 flex items-center justify-between"
              >
                <span className="text-sm">{f}</span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  coming soon
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
