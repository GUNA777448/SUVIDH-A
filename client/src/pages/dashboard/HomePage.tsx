import {
  Bolt,
  Droplets,
  FileText,
  Fuel,
  Landmark,
  Recycle,
  Search,
  UserCircle2,
  Zap,
} from "lucide-react";
import type { ComponentType } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "../../components/navigation/BottomNav";

type ServiceItem = {
  label: string;
  icon: ComponentType<{ className?: string }>;
};

const serviceItems: ServiceItem[] = [
  { label: "LPG Booking", icon: Fuel },
  { label: "Water Bill", icon: Droplets },
  { label: "Electricity", icon: Bolt },
  { label: "Waste Pickup", icon: Recycle },
  { label: "Muni Services", icon: Landmark },
  { label: "Tax Payment", icon: FileText },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-white pb-20 shadow-2xl shadow-[#1A73E8]/10">
      <header className="sticky top-0 z-10 bg-white px-4 pb-3 pt-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3">
            <Search className="size-4 text-slate-500" />
            <input
              readOnly
              value="Search for services, IDs, or complaints"
              className="w-full bg-transparent text-xs text-slate-600 outline-none"
            />
          </div>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-full border border-slate-200 bg-white text-[#1A73E8]"
            aria-label="Profile"
            onClick={() => navigate("/profile")}
          >
            <UserCircle2 className="size-6" />
          </button>
        </div>
      </header>

      <main className="space-y-5 px-4 pb-8 pt-2">
        <section className="overflow-x-auto">
          <div className="flex w-max gap-3">
            <article className="relative w-[330px] overflow-hidden rounded-2xl bg-gradient-to-r from-[#1A73E8] to-[#0f5ec9] p-4 text-white">
              <div className="absolute -right-4 -top-4 size-20 rounded-full bg-white/10" />
              <div className="absolute -bottom-6 right-10 size-16 rounded-full bg-emerald-300/20" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-blue-100">
                    Public Service Alert
                  </p>
                  <h2 className="mt-1 text-lg font-semibold">
                    Register for Solar Subsidy 2026
                  </h2>
                </div>
                <div className="rounded-xl bg-white/15 p-2">
                  <Zap className="size-6 text-emerald-200" />
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
          <div className="grid grid-cols-3 gap-3">
            {serviceItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border border-[#dbe8fb] bg-[#f7fbff] text-center"
                >
                  <div className="rounded-xl bg-white p-2.5 text-[#1A73E8] shadow-sm">
                    <Icon className="size-5" />
                  </div>
                  <span className="px-1 text-[11px] font-medium leading-tight text-slate-700">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="overflow-x-auto">
          <div className="flex w-max gap-2">
            {["Active Requests", "Digital Certificates", "SOS Emergency"].map(
              (pill) => (
                <button
                  key={pill}
                  type="button"
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm"
                >
                  {pill}
                </button>
              ),
            )}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
