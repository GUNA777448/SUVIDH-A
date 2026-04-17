import {
  ArrowRight,
  Bolt,
  ClipboardList,
  Droplets,
  Flame,
  Recycle,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

const services = [
  {
    title: "Gas Distribution",
    subtitle: "Book cylinder, service and complaint support",
    icon: Flame,
    to: "/services/gas",
    active: true,
  },
  {
    title: "Electricity",
    subtitle: "Meter reading and bill management",
    icon: Bolt,
    to: "/services/electricity",
    active: true,
  },
  {
    title: "Water",
    subtitle: "Connection, billing and tanker requests",
    icon: Droplets,
    to: "/services/water",
    active: true,
  },
  {
    title: "Waste Management",
    subtitle: "Pickup requests and complaint tracking",
    icon: Recycle,
    to: "/services/waste",
    active: true,
  },
];

export default function ServicesPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="min-h-screen w-full bg-[#131314] px-4 pb-24 pt-5 text-[#E3E3E3]">
      <div className="mx-auto w-full max-w-md space-y-5">
        <section className="rounded-3xl border border-white/10 bg-[#1E1F20] p-5 shadow-[0_10px_30px_-22px_rgba(0,0,0,0.7)]">
          <p className="material-label uppercase text-[#A8C7FA]">Service Hub</p>
          <div className="mt-2 flex items-start justify-between gap-4">
            <div>
              <h1 className="material-headline text-white">Municipal Services</h1>
              <p className="material-body mt-2 max-w-72 text-slate-300">
                Choose a service to manage requests, billing, and support from a
                single place.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#2A2B2C] px-3 py-2 text-right">
              <p className="material-label text-slate-400">Available</p>
              <p className="material-body font-medium text-white">4 services</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-2">
          <article className="rounded-2xl border border-white/10 bg-[#1E1F20] p-3">
            <p className="material-label text-slate-400">Requests</p>
            <p className="material-headline mt-1 text-white">Live</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-[#1E1F20] p-3">
            <p className="material-label text-slate-400">Bills</p>
            <p className="material-headline mt-1 text-white">Track</p>
          </article>
          <article className="rounded-2xl border border-white/10 bg-[#1E1F20] p-3">
            <p className="material-label text-slate-400">Support</p>
            <p className="material-headline mt-1 text-white">24x7</p>
          </article>
        </section>

        <section className="space-y-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <button
                key={service.title}
                type="button"
                onClick={() => navigate(service.to)}
                className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-[#1E1F20] px-4 py-4 text-left shadow-[0_10px_30px_-24px_rgba(0,0,0,0.7)]"
              >
                <div className="flex items-start gap-3">
                  <span className="rounded-lg bg-[#2A2B2C] p-2 text-[#A8C7FA]">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {service.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {service.subtitle}
                    </p>
                  </div>
                </div>
                <ArrowRight className="size-4 text-[#A8C7FA]" />
              </button>
            );
          })}
        </section>

        <section className="rounded-3xl border border-white/10 bg-[#1E1F20] p-5 shadow-[0_10px_30px_-22px_rgba(0,0,0,0.7)]">
          <p className="material-label text-[#A8C7FA]">Quick Actions</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => navigate("/transactions")}
              className="rounded-2xl border border-white/10 bg-[#2A2B2C] p-4 text-left"
            >
              <ClipboardList className="size-5 text-[#A8C7FA]" />
              <p className="material-label mt-3 text-white">My Requests</p>
              <p className="mt-1 text-[11px] leading-4 text-slate-400">
                Review active bookings and history.
              </p>
            </button>

            <button
              type="button"
              onClick={() => navigate("/services/electricity/billing")}
              className="rounded-2xl border border-white/10 bg-[#2A2B2C] p-4 text-left"
            >
              <Wallet className="size-5 text-[#A8C7FA]" />
              <p className="material-label mt-3 text-white">Payments</p>
              <p className="mt-1 text-[11px] leading-4 text-slate-400">
                Open billing and pay pending dues.
              </p>
            </button>

            <button
              type="button"
              onClick={() => navigate("/officers")}
              className="rounded-2xl border border-white/10 bg-[#2A2B2C] p-4 text-left"
            >
              <ShieldCheck className="size-5 text-[#A8C7FA]" />
              <p className="material-label mt-3 text-white">Support</p>
              <p className="mt-1 text-[11px] leading-4 text-slate-400">
                Find officers and assistance routes.
              </p>
            </button>

            <button
              type="button"
              onClick={() => navigate("/home")}
              className="rounded-2xl border border-white/10 bg-[#2A2B2C] p-4 text-left"
            >
              <Flame className="size-5 text-[#A8C7FA]" />
              <p className="material-label mt-3 text-white">Dashboard</p>
              <p className="mt-1 text-[11px] leading-4 text-slate-400">
                Return to your citizen overview.
              </p>
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
