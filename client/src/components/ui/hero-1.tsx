import { ArrowRight, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function Hero1() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-[#d7e5f5] bg-gradient-to-br from-[#0b2e59] via-[#144b8d] to-[#1A73E8] p-5 text-white shadow-lg">
      <div className="absolute -right-10 -top-10 size-28 rounded-full bg-white/10" />
      <div className="absolute -bottom-12 left-12 size-24 rounded-full bg-emerald-300/20" />
      <div className="relative space-y-3">
        <Badge variant="secondary" className="bg-white/15 text-white">
          <Sparkles className="size-3" />
          21st.dev Inspired Hero
        </Badge>
        <h2 className="font-display text-2xl font-semibold leading-tight">
          SUVIDHA Smart Citizen Dashboard
        </h2>
        <p className="max-w-xs text-sm text-blue-50">
          Access utility services, track payments, and connect with ward
          officers from one reliable portal.
        </p>
        <Button className="mt-1 bg-white text-[#0b2e59] hover:bg-white/90">
          Explore Services
          <ArrowRight className="ml-1 size-4" />
        </Button>
      </div>
    </section>
  );
}

export { Hero1 };
