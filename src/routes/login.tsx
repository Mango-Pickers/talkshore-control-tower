import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Anchor, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { signIn, user } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    // already authed
    setTimeout(() => nav({ to: "/dashboard" }), 0);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Welcome aboard.");
    nav({ to: "/dashboard" });
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(0.35_0.1_260)_0%,transparent_50%),radial-gradient(circle_at_70%_80%,oklch(0.4_0.12_220)_0%,transparent_55%)]" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-md"
        >
          <div className="size-14 rounded-2xl grid place-items-center bg-gradient-to-br from-gold to-gold-hover mb-8 shadow-2xl">
            <Anchor className="size-7 text-[oklch(0.18_0.04_255)]" />
          </div>
          <h1 className="font-display text-5xl leading-tight mb-4">
            The bridge of <span className="ts-gold-text italic">TalkShore</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Mission control for a luxury language voyage platform. Pilot guides, ports, and live
            shores from a single immersive command center.
          </p>
        </motion.div>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-12">
        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="ts-card p-8 w-full max-w-md"
        >
          <div className="text-[10px] uppercase tracking-[0.3em] text-gold mb-2">Control Tower</div>
          <h2 className="font-display text-3xl mb-1">Admin sign-in</h2>
          <p className="text-sm text-muted-foreground mb-8">Authorized personnel only.</p>

          <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Email</label>
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full h-11 rounded-xl bg-elevated border border-border px-4 mb-5 focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="admin@talkshore.com"
          />
          <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Password</label>
          <input
            type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full h-11 rounded-xl bg-elevated border border-border px-4 mb-6 focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="••••••••"
          />
          <button
            type="submit" disabled={loading}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-gold to-gold-hover text-[oklch(0.18_0.04_255)] font-semibold flex items-center justify-center gap-2 hover:brightness-110 transition disabled:opacity-60"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            Board the bridge
          </button>
          <p className="mt-6 text-xs text-muted-foreground text-center">
            Access is gated by your role in <code className="text-gold">user_roles</code>.
          </p>
        </motion.form>
      </div>
    </div>
  );
}
